/**
 * InteractiveQueryTextInput
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

import { createElement, createFactory, ReactElement, CSSProperties, ChangeEvent, FormEvent } from 'react';
import * as D from 'react-dom-factories';
import { FormGroup, FormControl } from 'react-bootstrap';
import { find } from 'lodash';
import * as maybe from 'data.maybe';
import TextareaAutosize from 'react-textarea-autosize';

import ReactSelectComponent from 'react-select';
const ReactSelect = createFactory(ReactSelectComponent);

import { Rdf, vocabularies, XsdDataTypeValidation } from 'platform/api/rdf';
import { SparqlClient, SparqlUtil } from 'platform/api/sparql';

import { FieldDefinition, getPreferredLabel } from '../FieldDefinition';
import { FieldValue, AtomicValue, EmptyValue, FieldError, DataState } from '../FieldValues';
import { SingleValueInput, AtomicValueInput, AtomicValueInputProps } from './SingleValueInput';
import { ValidationMessages } from './Decorations';

interface Language {
  key: string;
  value: string;
}

type ValidationStyle = 'success' | 'warning' | 'error' | undefined;

export interface InteractiveQueryTextInputProps extends AtomicValueInputProps {
  placeholder?: string;
  multiline?: boolean;
  languages?: string[];
  requireLanguage?: boolean;
  query: string;
  repository?: string;
  resultprefix?: string;
  resultpostfix?: string;
}

interface State {
  text: string;
  language: string;
  queryResult: string;
}

export class InteractiveQueryTextInput extends AtomicValueInput<InteractiveQueryTextInputProps, State> {
  private hasFocus = false;
  private languages: string[];

  constructor(props: InteractiveQueryTextInputProps, context: any) {
    super(props, context);
    this.state = this.reformatText(props);
    this.languages = this.getAvailableLanguages();
  }

  componentDidMount() {
    if (this.languages.length > 0 && this.props.requireLanguage) {
      this.setState({ language: this.languages[0] });
    }
    if (this.state.text) {
      this.executeQuery(this.state.text);
    }
  }

  componentWillReceiveProps(nextProps: InteractiveQueryTextInputProps) {
    if (!this.hasFocus) {
      this.setState(this.reformatText(nextProps));
    }
  }

  render() {
    return D.div(
      { className: 'plain-text-field' },
      D.div({ className: 'plain-text-field__inputs' }, this.renderElement(), this.renderLanguageSelect()),
      D.div({ className: 'interactive-query-result-field form-control' }, this.renderQueryResult()),
      createElement(ValidationMessages, { errors: FieldValue.getErrors(this.props.value) })
    );
  }

  /**
   * Display as <input> field or <textarea>.
   */
  private isMultiline() {
    return this.props.multiline || false;
  }

  private getAvailableLanguages() {
    let languages: string[] = [];
    if (this.props.languages) {
      languages = languages.concat(this.props.languages);
    }

    const rdfNode = FieldValue.asRdfNode(this.props.value);
    const nodeLanguage = getLanguageFromNode(rdfNode);
    if (nodeLanguage && languages.indexOf(nodeLanguage) < 0) {
      languages.push(nodeLanguage);
    }

    return languages;
  }

  private reformatText(props: InteractiveQueryTextInputProps): State {
    const rdfNode = FieldValue.asRdfNode(props.value);
    const selectedLanguage = this.state ? this.state.language : undefined;
    return {
      text: rdfNode ? rdfNode.value : '',
      language: rdfNode ? getLanguageFromNode(rdfNode) : selectedLanguage,
    };
  }

  private onTextChanged = (event: FormEvent<FormControl> | ChangeEvent<HTMLTextAreaElement>) => {
    const text = (event.target as any).value;
    const language = this.state.language;
    this.executeQuery(text);
    this.setState({ text, language });
    this.setAndValidate(this.createValue(text, language));
  };

  private onLanguageChanged(language: Language): void {
    const text = this.state.text;
    this.setState({ text, language: language.key });
    if (!FieldValue.isEmpty(this.props.value)) {
      // create new value only if there was an old value
      this.setAndValidate(this.createValue(text, language.key));
    }
  }

  private createValue(text: string, language: string): AtomicValue | EmptyValue {
    if (text.length === 0) {
      return FieldValue.empty;
    }

    let datatype = this.props.definition.xsdDatatype || vocabularies.xsd._string;
    if (!language && XsdDataTypeValidation.sameXsdDatatype(datatype, vocabularies.rdf.langString)) {
      // Replace rdf:langString -> xsd:string if no language specified
      datatype = vocabularies.xsd._string;
    }

    let value: Rdf.Node;
    if (language) {
      value = Rdf.langLiteral(text, language);
    } else if (XsdDataTypeValidation.sameXsdDatatype(datatype, vocabularies.xsd.anyURI)) {
      value = Rdf.iri(text);
    } else {
      value = Rdf.literal(text, datatype);
    }

    return AtomicValue.set(this.props.value, { value });
  }

  private getStyle(): ValidationStyle {
    if (this.props.dataState === DataState.Verifying) {
      return undefined;
    }
    const value = this.props.value;
    const errors = FieldValue.getErrors(value);
    if (errors.size > 0) {
      return errors.some(FieldError.isPreventSubmit) ? 'error' : 'warning';
    } else {
      return undefined;
    }
  }

  private renderElement(): ReactElement<any> {
    const definition = this.props.definition;
    const rdfNode = FieldValue.asRdfNode(this.props.value);

    const placeholder =
      typeof this.props.placeholder === 'undefined'
        ? this.createDefaultPlaceholder(definition)
        : this.props.placeholder;

    if (this.isMultiline()) {
      return createElement(TextareaAutosize, {
        className: 'plain-text-field__text',
        style: getTextAreaStyle(this.getStyle()),
        value: this.state.text,
        placeholder: placeholder,
        onChange: this.onTextChanged,
      });
    } else {
      return createElement(
        FormGroup,
        { validationState: this.getStyle() },
        createElement(FormControl, {
          className: 'plain-text-field__text',
          value: this.state.text,
          type: 'text',
          placeholder: placeholder,
          onChange: this.onTextChanged,
          onFocus: () => {
            this.hasFocus = true;
          },
          onBlur: () => {
            this.hasFocus = false;
            this.setState(this.reformatText(this.props));
          },
          title: rdfNode ? rdfNode.toString() : undefined,
          readOnly: !this.canEdit(),
        })
      );
    }
  }

  private getOptionsForLanguageSelect(languages: string[]) {
    const options = languages.map((lang) => {
      return { key: lang, label: lang };
    });
    if (!this.props.requireLanguage) {
      options.unshift({ key: undefined, label: 'No language' });
    }
    return options;
  }

  private renderLanguageSelect() {
    if (this.languages.length < 1) {
      return undefined;
    }

    const options = this.getOptionsForLanguageSelect(this.languages);
    const language = this.state.language;
    const selectedOption = find(options, (option) => option.key === language);

    return ReactSelect({
      // @TODO: add dynamic name
      className: 'plain-text-field__language',
      onChange: (lang) => this.onLanguageChanged(lang as Language),
      options: options,
      value: selectedOption,
      disabled: options.length < 1,
      clearable: false,
    });
  }

  private renderQueryResult(): ReactElement<any> {
    let result = "";
    if (this.state.queryResult) {
      const res = this.state.queryResult.get();
      if (!SparqlUtil.isSelectResultEmpty(res)) {
        const firstBindingVar = res.head.vars[0];
        result = res.results.bindings[0][firstBindingVar].value;
      }
    }
    if (this.props.resultprefix)
      result = this.props.resultprefix + result; 
    if (this.props.resultpostfix)
      result = result + this.props.resultpostfix;
      
    return D.span(null, result);
  }

  private createDefaultPlaceholder(definition: FieldDefinition): string {
    return `Enter ${(getPreferredLabel(definition.label) || 'value').toLocaleLowerCase()} here...`;
  }

  /**
   * Executes the SPARQL Select query binding input text to ?value and pushes results to state.
   */
  private executeQuery = (text: string): void => {
    if (!this.props.query) return;
    const context = this.context.semanticContext;
    if (this.props.repository) {
      context.repository = this.props.repository;
    }
    let query = SparqlUtil.parseQuerySync(this.props.query);
    // bind current input text to ?value
    query = SparqlClient.setBindings(query, {'value': Rdf.literal(text)})
    SparqlClient.select(query, { context })
      .onValue((result) =>
        this.setState({
          queryResult: maybe.Just(result)
        })
      )
      .onError((error) =>
        this.setState({
          queryResult: error
        })
      );
  };

  static makeHandler = AtomicValueInput.makeAtomicHandler;
}

function getLanguageFromNode(node: Rdf.Node): string | undefined {
  if (!(node && node.isLiteral())) {
    return undefined;
  }
  return node.language ? node.language : undefined;
}

function getTextAreaStyle(style: ValidationStyle): CSSProperties {
  switch (style) {
    case 'warning':
      return { borderColor: '#e99002' };
    case 'error':
      return { borderColor: '#d32a0e' };
    default:
      return {};
  }
}

SingleValueInput.assertStatic(InteractiveQueryTextInput);

export default InteractiveQueryTextInput;
