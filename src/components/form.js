import React, {Component} from 'react';
import {Button, Text, SmallText, Label, TextInput, NumericInput, PasswordInput, Checkbox, RadioGroup, Link, Icon} from 'rnsuite';
import {View, StyleSheet} from 'react-native'
import * as Inflector from 'inflected';
//import request from '../request';
import Loading from './loading';
import I18n from '../i18n';

const JUST_SUBMITTED_TIMEOUT = 2500;


export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {just_submitted: false};
  }

  componentDidUpdate(prevProps) {
    let {submitting, errors} = this.props;
    if (prevProps.submitting && !submitting && (!errors || errors.length === 0)) {
      this.setState({just_submitted: true});
      setTimeout(() => this.setState({just_submitted: false}), JUST_SUBMITTED_TIMEOUT);
    }
  }

  change(field, e) {
    let {model, onChange, onChangeField} = this.props;
    let {name, value} = e.target;
    if (onChangeField) onChangeField(name, value);
    model[name] = value;
    if (onChange) onChange(model);
  }

  renderField(field, prefix, model, errors={}) {
    if (field.visible && !field.visible(model)) return null;
    let {onChange, readOnly} = this.props;
    let props = {key: field.name, prefix, field, model, readOnly}

    props.value = model[field.name];
    props.errors = errors[field.name];
    props.onChange = (e, meta) => this.change(field, e, meta);
    props.globalOnChange = onChange;

    let component = getFieldComponent(field);
    return React.createElement(component, props);
  }

  renderSubmit() {
    let { model, fields, readOnly, onSubmit, submitting, singleton, submitLabel} = this.props;
    let modelName = this.props.modelName || this.props.model_name;
    modelName = I18n.t('models._' + modelName);

    if (readOnly || !onSubmit) return null;

    let label, icon, disabled;

    if (this.state.just_submitted) {
      if (model.id || singleton) {
        label = I18n.t('model_updated', {model: modelName});
      } else {
        label = I18n.t('model_created', {model: modelName});
      }

      //icon = <i className="glyphicon glyphicon-ok" />
    }

    else if (submitting) {
      disabled = true;
      label = I18n.t('submitting');
      // label = "Submitting " + modelName;
      // icon = <Icon name="spinner" />
    }

    else {
      if (submitLabel) {
        label = submitLabel;
      } else if (model.id || singleton) {
        label = I18n.t('update_model', {model: modelName});
      } else {
        label = I18n.t('create_model', {model: modelName});
      }

      disabled = !isFormValid(model, fields);
    }


    return (
      <Button disabled={disabled} onPress={onSubmit} icon={icon} text={label} style={{marginBottom:10}} />
    )
  }

  renderCancel() {
    let {onCancel} = this.props;
    if (!onCancel) return null;
    return (
      <Button accent text={I18n.t('cancel')} onPress={onCancel} />
    );
  }


  renderButtons() {
    let {hideButtons} = this.props;
    if (hideButtons) return null;

    return (
      <View style={styles.form_buttons}>
        {this.renderSubmit()}
        {this.renderCancel()}
      </View>
    )
  }

  render() {
    let {fields, model, errors, prefix, containerElement} = this.props;

    return (
      <View>
        {fields.map(f => this.renderField(f, prefix, model, errors))}
        {this.renderButtons()}
      </View>
    );
  }
}

class FormField extends Component {
  containerClass(field, errors) {
    let className = "form-group " + this.fieldID();
    if (field.required) className += " required";
    if (errors) className += " has-error";
    return className;
  }

  fieldID() {
    let {field, prefix} = this.props;
    return [prefix, field.name].filter(i => !!i).join('_');
  }

  labelClass(field, errors) {
    let className="control-label";
    if (field.required) className += " required";
    return className;
  }

  renderHint(field) {
    if (!field.hint) return null;
    return (
      <SmallText className="help-block">{field.hint}</SmallText>
    );
  }

  renderLabel(field) {
    return getFieldLabel(field);
  }

  renderErrors(errors) {
    if (!errors) return null;
    let message = errors.join(', ');
    return (
      <SmallText>{message}</SmallText>
    );
  }

  renderFormGroup(child) {
    let {field, errors, onChange} = this.props;
    let labelRequired = field.required ? <Text>*</Text> : null;

    let className = "form-control";
    if (field.required) className += " required";

    return (
      <View>
        <Label> {labelRequired} {this.renderLabel(field)}</Label>
        {child}
        {this.renderHint(field)}
        {this.renderErrors(errors)}
      </View>
    )
  }

  isReadOnly() {
    return this.props.readOnly;
  }

  isDisabled() {
    let {field, model} = this.props;
    if (!field.disabled) return false
    if (typeof field.disabled === 'function') {
      return field.disabled(model);
    }
    return field.disabled;
  }

  getValueLabel() {
    let {field, value} = this.props;
    if (field.valueLabelCallback) {
      return field.valueLabelCallback(this.props.model);
    }
    return value;
  }

  renderValue() {
    let {field} = this.props;
    let value = this.getValueLabel();
    return (
      <dl>
       <dt>{this.renderLabel(field)}</dt>
      <dd>{value}</dd>
      </dl>

    );
  }

  render() {
    if (this.isReadOnly()) {
      return this.renderValue();
    } else {
      return this.renderInput();
    }
  }
}




class StringInput extends FormField {
  renderInput() {
    let {field, value, onChange} = this.props;

    return this.renderFormGroup(
      <TextInput id={this.fieldID()} name={field.name} value={value || ''} disabled={this.isDisabled()} onChange={onChange} placeholder={field.placeholder} multiline={field.multiline} {...field.extra} />
    )
  }
}

class EmailInput extends FormField {
  renderInput() {
    let {field, value, onChange} = this.props;

    return this.renderFormGroup(
      <TextInput id={this.fieldID()} name={field.name} value={value || ''} disabled={this.isDisabled()} onChange={onChange} keyboardType="email-address" autoCapitalize="none" placeholder={field.placeholder} {...field.extra} />
    )
  }
}

class PasswordInputComponent extends FormField {
  renderInput() {
    let {field, value, onChange} = this.props;

    return this.renderFormGroup(
      <PasswordInput id={this.fieldID()} name={field.name} value={value || ''} disabled={this.isDisabled()} onChange={onChange} placeholder={field.placeholder} showPasswordLabel={I18n.t('show_password')}/>
    )
  }
}

class NumberInput extends FormField {
  onChange(e) {
    let {onChange} = this.props;
    let {name, value} = e.target;
    value = +value;
    onChange({target: {name, value}});
  }

  renderInput() {
    let {field, value, onChange} = this.props;

    let className = "form-control";
    if (field.required) className += " required";

    return this.renderFormGroup(
      <NumericInput id={this.fieldID()} name={field.name} value={value || ''} disabled={this.isDisabled()} onChange={e => this.onChange(e)} placeholder={field.placeholder} />
    )
  }
}

class CheckboxInput extends FormField {
  onChange(e) {
    let {onChange} = this.props;
    let {name, checked} = e.target;
    let value_label = checked ? 'Yes' : 'No';
    onChange({target: {name, value: checked}}, {value_label});
  }

  getValueLabel() {
    let {value} = this.props;
    if (value === undefined || value === null) return null;
    return value ? 'Yes' : 'No';
  }

  renderInput() {
    let {field, value, errors, onChange} = this.props;
    let labelRequired = field.required ? <abbr title="required">*</abbr> : null;

    let className = "form-control boolean";
    if (field.required) className += " required";
    return (
      <div className={this.containerClass(field, errors)}>
        <label className={this.labelClass(field)} htmlFor={field.name}> {labelRequired}
          <input type="checkbox" id={this.fieldID()}name={field.name} value={value || false} checked={value || false} disabled={this.isDisabled()} onChange={e => this.onChange(e)} />
          {this.renderLabel(field)}
        </label>
        {this.renderHint(field)}
        {this.renderErrors(errors)}
      </div>
    )
  }
}



class SelectInput extends FormField {
  getValueLabel() {
    let {field, value} = this.props;
    let options = buildOptions(field);
    let option = options.find(o => o.id === value);
    if (!option) return field.blankLabel || null;
    return option.label;
  }

  onChange(e) {
    let {value} = e.target;
    let {field, onChange} = this.props;
    let options = buildOptions(field);
    let option = options.find(o => o.id === value);
    let value_label = option ? option.label : undefined;
    let meta = {value_label};
    onChange(e, meta);
  }

  renderInput() {
    let {field, value, onChange} = this.props;
    let {required, blankLabel} = field;
    let className = "form-control";
    if (field.required) className += " required";

    let options = buildOptionsTags(field);

    let blank = <option value="">{blankLabel}</option>;

    return this.renderFormGroup(
      <select id={this.fieldID()} className={className} name={field.name} value={value || ''} disabled={this.isDisabled()} onChange={e => this.onChange(e)} >
        {blank}
        {options}
      </select>
    );
  }
}

class RadioInput extends FormField {
  getValueLabel() {
    let {field, value} = this.props;
    let options = buildOptions(field);
    let option = options.find(o => o.id === value);
    if (!option) return null;
    return option.label;
  }

  onChange(e) {
    let {value} = e.target;
    let {field, onChange} = this.props;
    let options = buildOptions(field);
    let option = options.find(o => o.id === value);
    let value_label = option ? option.label : undefined;
    let meta = {value_label};
    onChange(e, meta);
  }

  renderInput() {
    let {field, value, onChange} = this.props;
    let options = buildOptions(field);

    return this.renderFormGroup(
      <RadioGroup name={field.name} value={value} options={options} onChange={onChange} />
    );
  }
}

class MultipleCheckboxesInput extends FormField {
  getValue(field, value) {
    let options = buildOptions(field);
    let selected = []
    for (let s of value) {
      let option = options.find(o => o.id === s.id);
      if (option) selected.push(option.text);
    }

    let value_label = selected.join(', ');
    return value_label;
  }

  getValueLabel() {
    let {field, value} = this.props;
    if (!value) return null;
    return this.getValue(field, value);
  }

  onChange(e) {
    let {field, onChange, value} = this.props;
    if (!value) value = [];
    let option_id = e.target.value;
    let index = value.indexOf(option_id)

    if ( index === -1) {
      value.push(e.target.value);
    } else {
      value.splice(index, 1);
    }

    let value_label = this.getValue(field, value);
    let meta = {value_label};
    onChange({target: {name: field.name, value}}, meta);
  }

  renderInput() {
    let {field, value, onChange} = this.props;
    if (!value) value = [];

    let className = "form-control";
    if (field.required) className += " required";

    let options = buildOptions(field);
    return this.renderFormGroup(options.map(option => {
      let checked = value.findIndex(id => id === option.id) !== -1;
      return (
        <div className="checkbox" key={option.id}>
          <label>
            <input type="checkbox" name={field.name} value={option.id} checked={checked} disabled={this.isDisabled()} onChange={e => this.onChange(e)} />
            {option.label}
          </label>
        </div>
      );
    }));
  }
}




class ComponentInput extends FormField {
  getValueLabel() {
    return this.renderInput();
  }
  renderInput() {
    let {field, onChange} = this.props;
    let props = field.props || {};

    if (field.adapter) {
      props = field.adapter(this.props);
    }

    if (!props.onChange) {
      props.onChange = onChange;
    }

    return React.createElement(field.component, props)
  }
}

class HeaderInput extends FormField {
  renderInput() {
    let {field, value, onChange} = this.props;

    let label = getFieldLabel(field);
    return <h3>{label}</h3>;
  }
}


function getFieldComponent(field) {
  if (field.type && typeof field.type !== 'string') return field.type;
  if (field.type === 'component') return ComponentInput;
  if (field.type ==='select') return SelectInput;
  if (field.type === 'bool') return CheckboxInput;
  if (field.type === 'radio') return RadioInput;
  if (field.type === 'checkboxes') return MultipleCheckboxesInput;
  if (field.type === 'number') return NumberInput;
  if (field.type === 'header') return HeaderInput;
  if (field.type === 'password') return PasswordInputComponent;
  if (field.type === 'email') return EmailInput;
  return StringInput;
}


function isFormValid(model, fields) {
  for (let field of fields) {
    if (field.required && !isFieldValid(model, field)) {
      return false;
    }

  }
  return true;
}

function isFieldValid(model, field) {
  let value = model[field.name];
  if (field.visible && !field.visible(model)) return true;
  if (value === null || value === undefined) return false;
  if (field.type !== 'bool' &&  value.length === 0) return false;
  return true;
}

function buildOptions(field) {
  if (!field.collection) return [];

  if (Array.isArray(field.collection)) {
    return field.collection.map(record => {
      let id, label;

      if (field.idField) id = record[field.idField];
      else if (record.id !== undefined) id = record.id;
      else id = record;

      if (field.labelField) label = record[field.labelField];
      else if (record.name !== undefined) label = record.name;
      else label = record;

      if (field.labelTransform) label = transformText(label, field.labelTransform);


      return {id, label};
    });
  } else {
    return Object.keys(field.collection).map(id => {
      let label;

      if (field.labelField) label = field.collection[id][field.labelField]
      else if (field.collection[id].name !== undefined) label = field.collection[id].name
      else label = field.collection[id];

      if (field.labelTransform) label = transformText(label, field.labelTransform);
      return {id, label};
    });
  }
}


function buildOptionsTags(field) {
  return buildOptions(field).map(({id, label}) => <option key={id} value={id}>{label}</option>);
}


function getFieldLabel(field) {
  return field.label || Inflector.titleize(field.name);
}


function transformText(string, transform) {
  switch(transform) {
  case 'titleize': return Inflector.titleize(string);
  default: return string;
  }
}


/*
 * Export some utilities
 * -------------------------------------------------------------------*/

Form.FormField = FormField;
Form.getFieldLabel = getFieldLabel;


class EmbedForm extends Form {
    render() {
    let {fields, model, errors, prefix} = this.props;
    return (
      <div>
        {fields.map(f => this.renderField(f, prefix, model, errors))}
        {this.renderSubmit()}
        {this.renderCancel()}
      </div>
    )
  }
}


const styles = StyleSheet.create({
  form_buttons: {
    flexDirection: 'column'
  },
});
