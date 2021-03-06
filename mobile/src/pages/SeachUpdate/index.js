import React, { useState, useRef } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import * as Yup from 'yup';

import api from '../../services/api';
import sendError from '../../utils/sendError';
import QrReader from '../../components/QrReader';
import ActionButton from '../../components/ActionButton';
import { Input, Label, Button } from '../../components/Form';
import Alert from '../../components/Alert';

import { Container, MainScroll, Title } from './styles';

export default function SeachUpdate() {
  const [cameraSide, setCameraSide] = useState(true);
  const formRef = useRef(null);
  const nullProdutRef = useRef(null);
  const errorAlertRef = useRef(null);
  const navigation = useNavigation();

  async function handleSubmit(data, { reset }) {
    try {
      formRef.current.setErrors({});
      const schema = Yup.object().shape({
        barcode: Yup.number()
          .required('O código de barra é obrigatório.')
          .positive('O código de barra precisa ser um número positivo.')
          .integer('O código de barra precisa ser um número inteiro.'),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      const response = await api
        .get(`products_barcode`, {
          params: data,
        })
        .catch((error) => {
          if (!error.request.status) errorAlertRef.current.open();
        });
      reset();
      if (!response.data) nullProdutRef.current.open();
      else navigation.navigate('Update', { product: response.data });
    } catch (err) {
      sendError(err, formRef);
    }
  }

  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
        behavior='height'
        enable
        keyboardVerticalOffset={100}
      >
        <MainScroll>
          <Title>Buscar Produto</Title>
          <QrReader formRef={formRef} cameraSide={cameraSide} />

          <Form
            initialData={{ validity: new Date() }}
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <Label>Código de Barras:</Label>
            <Input
              name='barcode'
              keyboardType='numeric'
              placeholder='Digite o código de barras'
              iconName='local-offer'
            />
            <Button onPress={() => formRef.current.submitForm()} />
          </Form>
        </MainScroll>
      </KeyboardAvoidingView>
      <Alert
        ref={nullProdutRef}
        title='Erro'
        subtitle='Não existe produto com ese código de barra'
      />
      <Alert
        ref={errorAlertRef}
        title='Ops...'
        subtitle='Não foi possivel se conectar'
      />
      <ActionButton setCameraSide={setCameraSide} />
    </Container>
  );
}
