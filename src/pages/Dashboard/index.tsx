/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';

import { View, Image, ActivityIndicator } from 'react-native';

import formatValue from '../../utils/formatValue';
import { useCart } from '../../hooks/cart';
import api from '../../services/api';

import FloatingCart from '../../components/FloatingCart';

import {
  Container,
  ProductContainer,
  ProductImage,
  ProductList,
  Product,
  ProductTitle,
  PriceContainer,
  ProductPrice,
  ProductButton,
} from './styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      api
        .get<Product[]>('/products')
        .then(resp => {
          setProducts(resp.data);
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
        });
    }

    loadProducts();
  }, []);

  function handleAddToCart(item: Product): void {
    // TODO

    addToCart(item);
  }

  return (
    <Container>
      <ProductContainer>
        {loading ? (
          <View>
            <ActivityIndicator size="large" color="#e83f5b" />
          </View>
        ) : (
          <ProductList
            data={products}
            keyExtractor={item => item.id}
            ListFooterComponent={<View />}
            ListFooterComponentStyle={{
              height: 80,
            }}
            renderItem={({ item }) => (
              <Product>
                <ProductImage source={{ uri: item.image_url }} />
                <ProductTitle>{item.title}</ProductTitle>
                <PriceContainer>
                  <ProductPrice>{formatValue(item.price)}</ProductPrice>
                  <ProductButton
                    testID={`add-to-cart-${item.id}`}
                    onPress={() => handleAddToCart(item)}
                  >
                    <FeatherIcon size={20} name="plus" color="#C4C4C4" />
                  </ProductButton>
                </PriceContainer>
              </Product>
            )}
          />
        )}
      </ProductContainer>
      <FloatingCart />
    </Container>
  );
};

export default Dashboard;
