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

import './calendardate.scss';

// input format patterns include timezone offset to be compatible with XSD specification(?)
export const INPUT_XSD_DATE_FORMAT = 'YYYY-MM-DD';
// output format patterns for UTC moments (without timezone offset), compatible with ISO and XSD
export const OUTPUT_DATE_FORMAT = 'YYYY-MM-DD';

export type DatePickerMode = 'date' | 'year';
export type DatePickerCalendar = 'gregorian' | 'islamic' | 'persian' | 'jalali' | 'indian';

export interface CalendarDatePickerInputProps extends AtomicValueInputProps {
  mode?: DatePickerMode;
  calendar?: DatePickerCalendar;
  placeholder?: string;
}

export class CalendarDatePickerInput extends AtomicValueInput<CalendarDatePickerInputProps, {}> {
  private get datatype() {
    return this.props.definition.xsdDatatype || vocabularies.xsd.dateTime;
  }
  
  render() {
    const rdfNode = FieldValue.asRdfNode(this.props.value);
    const dateLiteral = dateLiteralFromRdfNode(rdfNode);
    const dateObject = dateObjectFromRdfLiteral(dateLiteral);

    // mode: date, year
    const mode = this.props.mode || getModeFromDatatype(this.datatype);
    let format = 'YYYY-MM-DD';
    let yearPicker = false;
    if (mode === 'year') {
      yearPicker = true;
      format = 'YYYY';
      dateObject?.setFormat(format);
    }
    
    // calendar: islamic, gregorian (default)
    let calendar: any;
    let locale: any;
    switch (this.props.calendar) {
      case 'islamic':
        calendar = ArabicCalendar;
        locale = ArabicEnLocale;
        break;
      case 'persian':
        calendar = PersianCalendar;
        locale = PersianEnLocale;
        break;
      case 'jalali':
        calendar = JalaliCalendar;
        locale = PersianEnLocale;
        break;
      case 'indian':
        calendar = IndianCalendar;
        locale = IndianEnLocale;
        break;
    }

    const displayedDate = dateObject
      ? dateObject
      : dateLiteral
      ? dateLiteral.value
      : rdfNode && rdfNode.isLiteral()
      ? rdfNode.value
      : undefined;

    const placeholder =
      typeof this.props.placeholder === 'undefined'
        ? defaultPlaceholder(this.props.definition, mode)
        : this.props.placeholder;

    return D.div(
      { className: 'date-picker-field' },

      createElement(DatePicker, {
        //className: 'rmdp-prime',
        inputClass: 'form-control',
        onChange: this.onDateSelected, // for keyboard changes
        onlyYearPicker: yearPicker,
        calendar: calendar,
        locale: locale,
        value: displayedDate,
        format: format,
        placeholder: placeholder
      }),

      createElement(ValidationMessages, { errors: FieldValue.getErrors(this.props.value) })
    );
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

export function getModeFromDatatype(datatype: Rdf.Iri): DatePickerMode {
  const parsed = XsdDataTypeValidation.parseXsdDatatype(datatype);
  if (parsed && parsed.prefix === 'xsd') {
    // TODO: handle dateTime?
    switch (parsed.localName) {
      case 'date':
        return 'date';
    }
  }
  return 'date';
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

function defaultPlaceholder(definition: FieldDefinition, mode: DatePickerMode) {
  const fieldName = (getPreferredLabel(definition.label) || mode).toLocaleLowerCase();
  return `Select or enter ${fieldName} here...`;
}

SingleValueInput.assertStatic(CalendarDatePickerInput);

export default CalendarDatePickerInput;
