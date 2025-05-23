import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductScreen = ({ route, navigation }) => {
  const { subcategoryId } = route.params;
  const [products, setProducts] = useState([]);
  const [cartItemsFromServer, setCartItemsFromServer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingCart, setIsCheckingCart] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (token && userId) {
        setIsAuthenticated(true);
        fetchCartItems(userId, token);
      } else {
        setIsAuthenticated(false);
        setIsCheckingCart(false);
      }

      fetchProducts();
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://192.168.59.67:5000/products/products/${subcategoryId}`);
        setProducts(res.data);
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        setError('Не удалось загрузить товары');
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };

    checkAuthAndFetch();
  }, [subcategoryId]);

  const fetchCartItems = async (userId, token) => {
    setIsCheckingCart(true);
    try {
      const res = await axios.get(`http://192.168.59.67:5000/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItemsFromServer(res.data.map(item => item.product_id));
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    } finally {
      setIsCheckingCart(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      alert('Для добавления в корзину необходимо авторизоваться.');
      navigation.navigate('Login');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');

    if (cartItemsFromServer.includes(product.id)) {
      alert('Товар уже в корзине.');
      return;
    }

    try {
      const res = await axios.post(
        'http://192.168.59.67:5000/cart/add',
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        setCartItemsFromServer(prevCart => [...prevCart, product.id]);
        alert('Товар успешно добавлен в корзину.');
      } else {
        alert('Не удалось добавить товар в корзину.');
      }
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину:', error);
      setError('Не удалось добавить товар в корзину.');
    }
  };

  const renderItem = ({ item }) => {
    const isInCart = cartItemsFromServer.includes(item.id);
    const isOutOfStock = item.stock_quantity === 0;
  
    // Проверяем, что ar_model_path существует и не пустой
    const hasARModel = item.ar_model_path && item.ar_model_path.trim() !== '';
  
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.9}
      >
        {/* AR-метка — отображается только если hasARModel === true */}
        {hasARModel && (
          <View style={styles.arBadge}>
            <Text style={styles.arText}>AR</Text>
          </View>
        )}
  
        {/* Основное содержимое карточки */}
        <Image source={{ uri: `http://192.168.59.67:5000${item.image}` }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#AED581" />
            <Text style={styles.productRating}>{item.rating}</Text>
          </View>
          <Text style={styles.productPrice}>
            {Math.floor(item.price)?.toLocaleString('ru-RU', {
              maximumFractionDigits: 0,
            })} ₸
          </Text>
  
          {isOutOfStock ? (
            <View style={styles.outOfStockContainer}>
              <Text style={styles.outOfStockText}>Нет в наличии</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addToCartButton, isInCart && styles.buttonDisabled]}
              onPress={() => handleAddToCart(item)}
              disabled={isInCart || !isAuthenticated || isCheckingCart}
            >
              <Text style={styles.addToCartText}>
                {isCheckingCart
                  ? 'Проверка...'
                  : isInCart
                    ? 'В корзине'
                    : isAuthenticated
                      ? 'Добавить'
                      : 'Авторизация'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" />;
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      </Animated.View>
    </View>
  );
};

// Стили
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F1F8E9',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    position: 'relative', // Важно для AR-метки
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: '#E8F5E9',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginBottom: 6,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productRating: {
    fontSize: 14,
    color: 'black',
    marginLeft: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  addToCartButton: {
    backgroundColor: '#81C784',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  outOfStockContainer: {
    backgroundColor: '#FFCDD2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
  // Стили для AR-метки
  arBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFEB3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  arText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProductScreen;