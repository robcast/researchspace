/**
 * ResearchSpace
 * Copyright (C) 2020, © Trustees of the British Museum
 * Copyright (C) 2015-2019, metaphacts GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { createElement, cloneElement, Props, ReactNode, Children } from 'react';
import * as Immutable from 'immutable';
import * as Kefir from 'kefir';

import { Cancellation } from 'platform/api/async';
import { Rdf } from 'platform/api/rdf';

import { Spinner } from 'platform/components/ui/spinner';

import { FieldDefinitionProp, FieldDefinition, normalizeFieldDefinition } from '../FieldDefinition';
import {
  AtomicValue,
  FieldValue,
  EmptyValue,
  CompositeValue,
  FieldError,
  FieldState,
  DataState,
  mergeDataState,
} from '../FieldValues';
import { InputMapping, validateFieldConfiguration, renderFields } from '../FieldMapping';
import { fieldInitialState, generateSubjectByTemplate, loadDefaults, tryBeginValidation } from '../FormModel';

import {
  SingleValueInput,
  SingleValueInputProps,
  SingleValueHandler,
  SingleValueHandlerProps,
} from './SingleValueInput';
import {
  MultipleValuesInput,
  MultipleValuesProps,
  MultipleValuesHandler,
  ValuesWithErrors,
} from './MultipleValuesInput';

import { InputKind } from './InputCommpons';

import DateObject from 'react-date-object';
import * as GregorianCalendar from 'react-date-object/calendars/gregorian';
import * as ArabicCalendar from 'react-date-object/calendars/arabic';
import * as PersianCalendar from 'react-date-object/calendars/persian';
import * as JalaliCalendar from 'react-date-object/calendars/jalali';
import * as IndianCalendar from 'react-date-object/calendars/indian';


export interface CompositeTimespanState {
  timespanType?: string;
  timespanCalendar?: string;
}

export interface CompositeTimespanInputProps extends SingleValueInputProps {
  fields: ReadonlyArray<FieldDefinitionProp>;
  newSubjectTemplate?: string;
  children?: ReactNode;
}

type ComponentProps = CompositeTimespanInputProps & Props<CompositeTimespanInput>;

interface InputState {
  readonly dataState: DataState.Ready | DataState.Verifying;
  readonly validation: Cancellation;
}
const READY_INPUT_STATE: InputState = {
  dataState: DataState.Ready,
  validation: Cancellation.cancelled,
};

const VALIDATION_DEBOUNCE_DELAY = 500;

type ChildInput = MultipleValuesInput<MultipleValuesProps, unknown>;

export class CompositeTimespanInput extends SingleValueInput<ComponentProps, CompositeTimespanState> {
  public static readonly inputKind = InputKind.CompositeInput;

  private readonly cancellation = new Cancellation();
  private compositeOperations = this.cancellation.derive();

  private shouldReload = true;
  private compositeState: DataState.Loading | DataState.Ready = DataState.Ready;
  private inputRefs = new Map<string, Array<ChildInput | null>>();
  private inputStates = new Map<string, InputState>();

  constructor(props: ComponentProps, context: any) {
    super(props, context);
    this.state = {
      timespanType: undefined,
      timespanCalendar: undefined
    }
    console.log("timespan constructor", props.for);
  }

  private getHandler(): CompositeTimespanHandler {
    const { handler } = this.props;
    if (!(handler instanceof CompositeTimespanHandler)) {
      throw new Error('Invalid value handler for CompositeTimespanInput');
    }
    console.log("timespan gethandler", handler);
    return handler;
  }

  componentDidMount() {
    console.log("timespan did mount", this.props.for);
    this.tryLoadComposite(this.props);
  }

  componentWillReceiveProps(props: ComponentProps) {
    if (props.value !== this.props.value) {
      // track reload requests separately to be able to suspend
      // composite load until `props.dataState` becomes `DataState.Ready`
      this.shouldReload = true;
    }
    this.tryLoadComposite(props);
  }

  componentWillUnmount() {
    this.cancellation.cancelAll();
  }

  // get current value from Select field state
  private getSelectValue(field: FieldState) {
    return field?.values.first()?.label;
  }

  // forceUpdate all date picker components
  private forceUpdateDateFields() {
    this.inputRefs.forEach((refs, key) => {
      if (key.startsWith('date_')) {
        for (const ref of refs) {
          ref?.forceUpdate();
        }
      }
    });
  }

  private tryLoadComposite(props: ComponentProps) {
    if (!(this.shouldReload && props.dataState === DataState.Ready)) {
      return;
    }
    const shouldLoad =
      !FieldValue.isComposite(props.value) ||
      // composite value requires to load definitions and defaults
      // (e.g. when value is restored from local storage)
      (props.value.fields.size > 0 && props.value.definitions.size === 0);
    if (shouldLoad) {
      this.shouldReload = false;
      this.loadComposite(props);
    }
  }

  private loadComposite(props: ComponentProps) {
    console.log("timespan load composite", this.props.for);
    this.compositeOperations = this.cancellation.deriveAndCancel(this.compositeOperations);
    const handler = this.getHandler();

    // filter model from unused field definitions
    // (the ones without corresponding input)
    const filterUnusedFields = <T>(items: Immutable.Iterable<string, T>) =>
      items.filter((item, fieldId) => handler.inputs.has(fieldId)).toMap();

    const definitions = filterUnusedFields(handler.definitions);
    const rawComposite = createRawComposite(props.value, definitions, handler.configurationErrors);

    this.compositeState = DataState.Loading;
    this.inputStates.clear();

    props.updateValue(() => rawComposite);
    this.compositeOperations
      .map(
        // add zero delay to force asynchronous observer call
        loadDefaults(rawComposite, handler.inputs).flatMap((v) => Kefir.later(0, v))
      )
      .observe({
        value: (change) => {
          let loaded = change(rawComposite);
          if (FieldValue.isComposite(props.value)) {
            loaded = mergeInitialValues(loaded, props.value);
          }
          this.compositeState = DataState.Ready;
          this.props.updateValue(() => loaded);
          // read state from child select components
          const typeField = loaded.fields.get('type');
          const typeValue = this.getSelectValue(typeField);
          const calendarField = loaded.fields.get('calendar');
          const calendarValue = this.getSelectValue(calendarField);
          const newState = {timespanType: typeValue, timespanCalendar: calendarValue};
          console.log("timespan load setstate", this.props.for, newState);
          this.setState(newState);
          this.forceUpdateDateFields();
        },
      });
  }

  private onFieldValuesChanged = (def: FieldDefinition, reducer: (previous: ValuesWithErrors) => ValuesWithErrors) => {
    this.props.updateValue((previous) => this.setFieldValue(def, previous, reducer));
  };

  private setFieldValue(
    def: FieldDefinition,
    oldValue: FieldValue,
    reducer: (previous: ValuesWithErrors) => ValuesWithErrors
  ): FieldValue {
    if (!FieldValue.isComposite(oldValue)) {
      return;
    }

    console.log("timespan setfieldvalue", this.props.for, def.id);

    const newValue = reduceFieldValue(def.id, oldValue, reducer);
    if (this.isInputLoading(def.id)) {
      this.inputStates.set(def.id, READY_INPUT_STATE);
    } else {
      this.startValidatingField(def, oldValue, newValue);
    }

    // change state based on child select components
    if (def.id === 'type') {
      const field = newValue.fields.get('type');
      const label = this.getSelectValue(field);
      if (label !== this.state.timespanType) {
        console.log("timespan setfieldvalue set", this.props.for, def.id, label);
        this.setState({timespanType: label});
        this.forceUpdateDateFields();
      }
    } else if (def.id === 'calendar') {
      const field = newValue.fields.get('calendar');
      const label = this.getSelectValue(field);
      if (label !== this.state.timespanCalendar) {
        console.log("timespan setfieldvalue set", this.props.for, def.id, label);
        this.setState({timespanCalendar: label});
        this.forceUpdateDateFields();
      }
    } /* else if (def.id === 'date_from' && this.state.timespanType === 'year') {
      const fromField = newValue.fields.get('date_from');
      const fromValue = fromField.values.first()?.value?.value;
      if (fromValue) {
        const XSD_DATE_FORMAT = 'YYYY-MM-DD';
        const fromDate = new DateObject({date: fromValue, format: XSD_DATE_FORMAT});
        let firstDay = new DateObject(fromDate).toFirstOfYear().format(XSD_DATE_FORMAT);
        let lastDay = new DateObject(fromDate).toLastOfYear().format(XSD_DATE_FORMAT);
        switch (this.state.timespanCalendar) {
          case 'islamic':
            firstDay = new DateObject(fromDate).convert(ArabicCalendar).toFirstOfYear().convert(GregorianCalendar).format(XSD_DATE_FORMAT);
            lastDay = new DateObject(fromDate).convert(ArabicCalendar).toLastOfYear().convert(GregorianCalendar).format(XSD_DATE_FORMAT);
            break;
          case 'persian':
            firstDay = new DateObject(fromDate).convert(PersianCalendar).toFirstOfYear().convert(GregorianCalendar).format(XSD_DATE_FORMAT);
            lastDay = new DateObject(fromDate).convert(PersianCalendar).toLastOfYear().convert(GregorianCalendar).format(XSD_DATE_FORMAT);
            break;
          case 'jalali':
            firstDay = new DateObject(fromDate).convert(JalaliCalendar).toFirstOfYear().convert(GregorianCalendar).format(XSD_DATE_FORMAT);
            lastDay = new DateObject(fromDate).convert(JalaliCalendar).toLastOfYear().convert(GregorianCalendar).format(XSD_DATE_FORMAT);
            break;
          case 'indian':
            firstDay = new DateObject(fromDate).convert(IndianCalendar).toFirstOfYear().convert(GregorianCalendar).format(XSD_DATE_FORMAT);
            lastDay = new DateObject(fromDate).convert(IndianCalendar).toLastOfYear().convert(GregorianCalendar).format(XSD_DATE_FORMAT);
            break;
        }
        if (firstDay !== fromValue) {
          console.log("not first of year?!");
          //fromField.values.first().value.value = firstDay;
        }
        const untilField = newValue.fields.get('date_until');
        const untilValue = untilField.values.first()?.value?.value;
        const refs = this.inputRefs.get('date_until');
        for (const ref of refs) {
          if (ref) {
            ref.props.updateValues((valuerrs) => {
              const values = valuerrs.values.map((value: FieldValue) => {
                if (FieldValue.isEmpty(value)) {
                  return value;
                } else {
                  return value;
                }});
              return {
                values: values,
                errors: valuerrs.errors
              };
            });
          }
        }
        /*
        if (untilValue && lastDay !== untilValue) {
          untilField.values.first().value.value = lastDay;
          const refs = this.inputRefs.get('date_until');
          for (const ref of refs) {
            ref?.forceUpdate();
          }
        }
        console.log("timespan setfieldvalue set", this.props.for, def.id);
      }
    } */

    return newValue;
  }

  private isInputLoading(fieldId: string): boolean {
    const refs = this.inputRefs.get(fieldId);
    if (!refs) {
      return true;
    }
    for (const ref of refs) {
      if (!ref || ref.dataState() === DataState.Loading) {
        return true;
      }
    }
    return false;
  }

  private startValidatingField(def: FieldDefinition, oldValue: CompositeValue, newValue: CompositeValue) {
    let { dataState, validation } = this.inputStates.get(def.id) || READY_INPUT_STATE;
    // immediately apply user edits in an input component
    // then update model with validation info when it'll be available
    const modelChange = tryBeginValidation(def, oldValue, newValue);

    dataState = modelChange ? DataState.Verifying : DataState.Ready;
    validation = this.compositeOperations.deriveAndCancel(validation);

    this.inputStates.set(def.id, { dataState, validation });

    if (modelChange) {
      validation.map(Kefir.later(VALIDATION_DEBOUNCE_DELAY, {}).flatMap(() => modelChange)).observe({
        value: (change) => {
          const current = this.props.value;
          if (!FieldValue.isComposite(current)) {
            return;
          }
          const validated = change(current);
          this.inputStates.set(def.id, READY_INPUT_STATE);
          this.props.updateValue(() => validated);
        },
      });
    }
  }

  dataState(): DataState {
    if (!FieldValue.isComposite(this.props.value)) {
      return DataState.Loading;
    } else if (this.compositeState !== DataState.Ready) {
      return this.compositeState;
    }

    let result = DataState.Ready;

    const fieldIds = this.props.value.definitions.map((def) => def.id).toArray();
    for (const fieldId of fieldIds) {
      const refs = this.inputRefs.get(fieldId);
      if (!refs) {
        //console.log("timespan datastate notref", fieldId);
        result = mergeDataState(result, DataState.Loading);
        continue;
      }
      for (const ref of refs) {
        if (ref) {
          //console.log("timespan datastate before merge", result, ref.props.for, fieldId);
          result = mergeDataState(result, ref.dataState());
          //console.log("timespan datastate after merge", result, ref.props.for);
        }
      }
    }

    //console.log("timespan datastate result", result);
    return result;
  }

  private dataStateForField = (fieldId: string): DataState => {
    if (this.compositeState !== DataState.Ready) {
      return this.compositeState;
    }
    const state = this.inputStates.get(fieldId) || READY_INPUT_STATE;
    return state.dataState;
  };

  render() {
    const composite = this.props.value;
    if (!FieldValue.isComposite(composite)) {
      return createElement(Spinner);
    }
    
    console.log("timespan render", this.props.for, this.state.timespanType, this.state.timespanCalendar, Children.count(this.props.children));

    // update props of child components
    let childComponents = this.props.children;
    // default mode: day
    let datePickerMode = 'day';
    let datePickerDate = true;
    let datePickerFrom = false;
    let datePickerUntil = false;
    if (this.state.timespanType === 'year') {
      // mode: year
      datePickerMode = 'year';
      datePickerDate = false;
      datePickerFrom = true;
      datePickerUntil = true;
    } else if (this.state.timespanType === 'range') {
      // mode: range
      datePickerDate = false;
      datePickerFrom = true;
      datePickerUntil = true;
    }
    const datePickerCalendar = this.state.timespanCalendar;
    childComponents = Children.map(this.props.children, (child: ReactNode) => {
      const name = child.props.for;
      if (name.startsWith('date_')) {
        if (!(this.state.timespanType && this.state.timespanCalendar)) {
          // do not render date picker when state is undefined
          return child;
        }
        if ((name === 'date_date' && datePickerDate)
        || (name === 'date_from' && datePickerFrom)
        || (name === 'date_until' && datePickerUntil)) {
          // return clone with modified props
          console.log("timespan render clone", this.props.for, name, datePickerMode, datePickerCalendar);
          return cloneElement(child, {
            mode: datePickerMode,
            calendar: datePickerCalendar
          });
        } else {
          // ignore unused date picker
          return null;
        }
      } else {
        return child;
      }
    });

    // render child components
    const childElements = renderFields(
      childComponents,
      composite,
      this.getHandler().handlers,
      this.dataStateForField,
      this.onFieldValuesChanged,
      this.onMountInput
    );

    return createElement('div', { className: 'composite-input' }, childElements);
  }

  private onMountInput = (
    inputId: string,
    inputIndex: number,
    inputRef: MultipleValuesInput<MultipleValuesProps, any> | null
  ) => {
    let refs = this.inputRefs.get(inputId);
    if (!refs) {
      refs = [];
      this.inputRefs.set(inputId, refs);
    }
    refs[inputIndex] = inputRef;
  };

  static makeHandler(props: SingleValueHandlerProps<CompositeTimespanInputProps>): CompositeTimespanHandler {
    return new CompositeTimespanHandler(props);
  }
}

class CompositeTimespanHandler implements SingleValueHandler {
  readonly newSubjectTemplate: string | undefined;
  readonly definitions: Immutable.Map<string, FieldDefinition>;
  readonly inputs: Immutable.Map<string, ReadonlyArray<InputMapping>>;
  readonly configurationErrors: Immutable.List<FieldError>;
  readonly handlers: Immutable.Map<string, ReadonlyArray<MultipleValuesHandler>>;

  constructor({ baseInputProps }: SingleValueHandlerProps<CompositeTimespanInputProps>) {
    console.log("timespan handler constructor");
    this.newSubjectTemplate = baseInputProps.newSubjectTemplate;
    this.definitions = normalizeDefinitons(baseInputProps.fields);
    const { inputs, errors } = validateFieldConfiguration(this.definitions, baseInputProps.children);
    this.inputs = inputs;
    this.configurationErrors = errors;
    this.handlers = inputs
      .map((mappings) =>
        mappings.map((mapping) =>
          MultipleValuesInput.getHandlerOrDefault(mapping.inputType as any, {
            definition: this.definitions.get(mapping.for),
            baseInputProps: mapping.element.props,
          })
        )
      )
      .toMap();
  }

  validate(value: FieldValue) {
    if (!FieldValue.isComposite(value)) {
      return value;
    }
    console.log("timespan handler validate", value);
    return CompositeValue.set(value, {
      fields: value.fields
        .map((state, fieldId) => {
          const handlers = this.handlers.get(fieldId);
          if (!handlers || handlers.length === 0) {
            return state;
          }
          let validated = state;
          for (const handler of handlers) {
            validated = handler.validate(validated);
          }
          return FieldState.set(state, validated);
        })
        .toMap(),
    });
  }

  finalize(value: FieldValue, owner: EmptyValue | CompositeValue): Kefir.Property<CompositeValue> {
    const finalizedComposite = this.finalizeSubject(value, owner);

    console.log("timespan handler finalize", value);

    const fieldProps = finalizedComposite.fields
      .map((state, fieldId) => {
        const handlers = this.handlers.get(fieldId);
        if (!handlers || handlers.length === 0) {
          return Kefir.constant(state);
        }
        let finalizing = Kefir.constant(state.values);
        for (const handler of handlers) {
          finalizing = finalizing.flatMap((v) => handler.finalize(v, finalizedComposite)).toProperty();
        }
        return finalizing.map((values) => {
          return FieldState.set(state, { values, errors: FieldError.noErrors });
        });
      })
      .toMap();

    return zipImmutableMap(fieldProps).map((fields) => {
      return CompositeValue.set(finalizedComposite, { fields });
    });
  }

  finalizeSubject(value: FieldValue, owner: EmptyValue | CompositeValue): CompositeValue {
    const sourceValue: CompositeValue = FieldValue.isComposite(value) ? value : createRawComposite(value);

    const ownerSubject = FieldValue.isComposite(owner) ? owner.subject : undefined;
    return CompositeValue.set(sourceValue, {
      subject: generateSubjectByTemplate(this.newSubjectTemplate, ownerSubject, sourceValue),
    });
  }
}

function normalizeDefinitons(rawFields: ReadonlyArray<FieldDefinitionProp>) {
  return Immutable.Map<string, FieldDefinition>().withMutations((result) => {
    for (const raw of rawFields) {
      if (result.has(raw.id)) {
        continue;
      }
      const parsed = normalizeFieldDefinition(raw);
      result.set(parsed.id, parsed);
    }
  });
}

function zipImmutableMap<K, V>(map: Immutable.Map<K, Kefir.Property<V>>): Kefir.Property<Immutable.Map<K, V>> {
  const mapAsArray = map
    .map((kefirValue, key) => {
      return kefirValue.map((value) => ({ key, value }));
    })
    .toArray();

  if (mapAsArray.length > 0) {
    return Kefir.zip(mapAsArray)
      .map((values) =>
        Immutable.Map<K, V>().withMutations((newMap) => {
          for (const { key, value } of values) {
            newMap.set(key, value);
          }
        })
      )
      .toProperty();
  } else {
    return Kefir.constant(Immutable.Map());
  }
}

function createRawComposite(
  sourceValue: FieldValue,
  definitions = Immutable.Map<string, FieldDefinition>(),
  errors = FieldError.noErrors
): CompositeValue {
  return {
    type: CompositeValue.type,
    subject: getSubject(sourceValue),
    definitions,
    fields: definitions.map(fieldInitialState).toMap(),
    errors,
  };
}

function getSubject(value: FieldValue): Rdf.Iri {
  if (FieldValue.isComposite(value)) {
    return value.subject;
  } else if (FieldValue.isAtomic(value)) {
    const node = FieldValue.asRdfNode(value);
    if (node.isIri()) {
      return node;
    }
  }
  return Rdf.iri('');
}

function mergeInitialValues(base: CompositeValue, patch: CompositeValue): CompositeValue {
  if (patch.fields.size === 0) {
    return base;
  }
  return CompositeValue.set(base, {
    fields: base.fields
      .map((state, fieldId) => {
        return patch.fields.get(fieldId, state);
      })
      .toMap(),
  });
}

function reduceFieldValue(
  fieldId: string,
  previous: CompositeValue,
  reducer: (previous: ValuesWithErrors) => ValuesWithErrors
) {
  const fieldState = previous.fields.get(fieldId, FieldState.empty);
  const updatedState = FieldState.set(
    fieldState,
    reducer({
      values: fieldState.values,
      errors: fieldState.errors,
    })
  );
  const fields = previous.fields.set(fieldId, updatedState);
  return CompositeValue.set(previous, { fields });
}

SingleValueInput.assertStatic(CompositeTimespanInput);

export default CompositeTimespanInput;
