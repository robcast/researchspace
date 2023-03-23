/**
 * CalendarDatePicker
 * Copyright (C) 2023, Robert Casties, MPIWG
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

import { find } from 'lodash';
import { createElement } from 'react';
import * as D from 'react-dom-factories';

import ReactSelect from 'react-select';

import DatePicker from 'react-multi-date-picker';
import DateObject from 'react-date-object';
import * as GregorianCalendar from 'react-date-object/calendars/gregorian';
import * as ArabicCalendar from 'react-date-object/calendars/arabic';
import * as PersianCalendar from 'react-date-object/calendars/persian';
import * as JalaliCalendar from 'react-date-object/calendars/jalali';
import * as IndianCalendar from 'react-date-object/calendars/indian';
import * as GregorianEnLocale from 'react-date-object/locales/gregorian_en';
import * as ArabicEnLocale from 'react-date-object/locales/arabic_en';
import * as PersianEnLocale from 'react-date-object/locales/persian_en';
import * as IndianEnLocale from 'react-date-object/locales/indian_en';

import { Rdf, vocabularies, XsdDataTypeValidation } from 'platform/api/rdf';

import { FieldDefinition, getPreferredLabel } from '../FieldDefinition';
import { FieldValue, AtomicValue, EmptyValue } from '../FieldValues';
import { SingleValueInput, AtomicValueInput, AtomicValueInputProps } from './SingleValueInput';
import { ValidationMessages } from './Decorations';

import './calendartimespan.scss';

// input format patterns include timezone offset to be compatible with XSD specification(?)
export const INPUT_XSD_DATE_FORMAT = 'YYYY-MM-DD';
// output format patterns for UTC moments (without timezone offset), compatible with ISO and XSD
export const OUTPUT_DATE_FORMAT = 'YYYY-MM-DD';

export type TimespanPickerMode = 'day' | 'year' | 'range';
export type DatePickerCalendar = 'gregorian' | 'islamic' | 'persian' | 'jalali' | 'indian';

export interface CalendarTimespanInputProps extends AtomicValueInputProps {
  mode?: TimespanPickerMode;
  calendar?: DatePickerCalendar;
  placeholder?: string;
}

export interface CalendarTimespanState {
  mode: TimespanPickerMode;
  calendar: DatePickerCalendar;
  fromDate: DateObject;
  untilDate: DateObject;
}

export class CalendarTimespanInput extends AtomicValueInput<CalendarTimespanInputProps, CalendarTimespanState> {

  constructor(props: CalendarTimespanInputProps, context: any) {
    super(props, context);
    this.state = {
      mode: props.mode || getModeFromDatatype(this.datatype) || 'day',
      calendar: props.calendar || 'gregorian',
      fromDate: undefined,
      untilDate: undefined,
    };
  }

  private get datatype() {
    return this.props.definition.xsdDatatype || vocabularies.xsd.dateTime;
  }
  
  render() {
    const rdfNode = FieldValue.asRdfNode(this.props.value);
    const dateLiteral = dateLiteralFromRdfNode(rdfNode);
    const dateObject = dateObjectFromRdfLiteral(dateLiteral);

    // mode: day, year, range
    let pickerFormat = 'YYYY-MM-DD';
    let yearPicker = false;
    let fromDateLabel = 'From';
    let fromDateDisabled = false;
    let untilDateLabel = 'Until';
    let untilDateDisabled = false;
    switch (this.state.mode) {
      case 'year':
        yearPicker = true;
        pickerFormat = 'YYYY';
        fromDateLabel = 'Year';
        fromDateDisabled = false;
        untilDateLabel = '';
        untilDateDisabled = true;
        break;
      case 'day':
        yearPicker = false;
        pickerFormat = 'YYYY-MM-DD';
        fromDateLabel = 'Day';
        fromDateDisabled = false;
        untilDateLabel = '';
        untilDateDisabled = true;
        break;
    }
    
    // calendar: islamic, gregorian (default)
    let calendarObject: any;
    let localeObject: any;
    switch (this.state.calendar) {
      case 'islamic':
        calendarObject = ArabicCalendar;
        localeObject = ArabicEnLocale;
        break;
      case 'persian':
        calendarObject = PersianCalendar;
        localeObject = PersianEnLocale;
        break;
      case 'jalali':
        calendarObject = JalaliCalendar;
        localeObject = PersianEnLocale;
        break;
      case 'indian':
        calendarObject = IndianCalendar;
        localeObject = IndianEnLocale;
        break;
    }

    const placeholder =
      typeof this.props.placeholder === 'undefined'
        ? defaultPlaceholder(this.props.definition, this.state.mode)
        : this.props.placeholder;

    // create dateUntil date picker element if necessary
    let untilDateElement: any;
    if (!untilDateDisabled) {
      untilDateElement = D.label(
        { className: 'timespan-label'}, 
        untilDateLabel,
        createElement(DatePicker, {
          inputClass: 'form-control',
          onChange: this.onDateSelected,
          onlyYearPicker: yearPicker,
          disabled: untilDateDisabled,
          calendar: calendarObject,
          locale: localeObject,
          value: this.state.untilDate,
          format: pickerFormat,
          placeholder: placeholder
        })
      )
    }

    // create TimespanInput element
    return D.div(
      { className: 'timespan-picker-field' },
      // type and calendar select div
      D.div({},
        D.label(
          { className: 'timespan-label'}, 
          'Timespan type',
          D.select(
            { value: this.state.mode, onChange: this.onTypeChange },
            D.option({value: 'day'}, 'day'),
            D.option({value: 'year'}, 'year'),
            D.option({value: 'range'}, 'range'),
          )
        ),
        D.label(
          { className: 'timespan-label'}, 
          'Calendar',
          D.select(
            { value: this.state.calendar, onChange: this.onCalendarChange }, 
            D.option({value: 'gregorian'}, 'gregorian'),
            D.option({value: 'islamic'}, 'islamic'),
            D.option({value: 'persian'}, 'persian'),
            D.option({value: 'jalali'}, 'jalali'),
            D.option({value: 'indian'}, 'indian'),
          )
        )
      ),
      // date picker div
      D.div({},
        D.label(
          { className: 'timespan-label'}, 
          fromDateLabel,
          createElement(DatePicker, {
            inputClass: 'form-control',
            onChange: this.onDateSelected,
            onlyYearPicker: yearPicker,
            disabled: fromDateDisabled,
            calendar: calendarObject,
            locale: localeObject,
            value: this.state.fromDate,
            format: pickerFormat,
            placeholder: placeholder
          })
        ),
        untilDateElement),
      
      createElement(ValidationMessages, { errors: FieldValue.getErrors(this.props.value) })
    );
  }

  private onTypeChange = (event: any) => {
    const value = event.target.value;
    this.setState({ mode : value});
  }

  private onCalendarChange = (event: any) => {
    const value = event.target.value;
    this.setState({ calendar : value });
  }

  private onDateSelected = (value: string | DateObject) => {
    let parsed: AtomicValue | EmptyValue;
    if (typeof value === 'string') {
      // if user enter a string without using the date picker
      // we pass direclty to validation
      parsed = this.parse(value);
    } else {
      // otherwise we convert to gregorian calendar and format
      const gregorianDate = value.convert(GregorianCalendar, GregorianEnLocale);
      const formattedDate = gregorianDate.format(OUTPUT_DATE_FORMAT);
      parsed = this.parse(formattedDate);
    }
    this.setAndValidate(parsed);
  };

  private parse(isoDate: string): AtomicValue | EmptyValue {
    if (isoDate.length === 0) {
      return FieldValue.empty;
    }
    return AtomicValue.set(this.props.value, {
      value: Rdf.literal(isoDate, this.datatype),
    });
  }

  static makeHandler = AtomicValueInput.makeAtomicHandler;
}

export function getModeFromDatatype(datatype: Rdf.Iri): TimespanPickerMode {
  const parsed = XsdDataTypeValidation.parseXsdDatatype(datatype);
  if (parsed && parsed.prefix === 'xsd') {
    // TODO: handle dateTime?
    switch (parsed.localName) {
      case 'date':
        return 'day';
    }
  }
  return 'day';
}

function dateLiteralFromRdfNode(node: Rdf.Node | undefined): Rdf.Literal | undefined {
  if (!node || !node.isLiteral()) {
    return undefined;
  }
  const dateString = node.value;
  const types = [vocabularies.xsd.date, vocabularies.xsd.time, vocabularies.xsd.dateTime];
  return find(
    types.map((type) => Rdf.literal(dateString, type)),
    (literal) => XsdDataTypeValidation.validate(literal).success
  );
}

export function dateObjectFromRdfLiteral(literal: Rdf.Literal | undefined): DateObject | undefined {
  if (!literal) {
    return undefined;
  }
  const parsedDate = new DateObject({date: literal.value, format: INPUT_XSD_DATE_FORMAT});
  return parsedDate;
}

function defaultPlaceholder(definition: FieldDefinition, mode: TimespanPickerMode) {
  const fieldName = (getPreferredLabel(definition.label) || mode).toLocaleLowerCase();
  return `Select or enter ${fieldName} here...`;
}

SingleValueInput.assertStatic(CalendarTimespanInput);

export default CalendarTimespanInput;
