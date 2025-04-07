import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SubcategoryScreen from './screens/SubcategoryScreen'; // Ваш экран подкатегорий
import ProductScreen from './screens/ProductScreen'; // Ваш экран с продуктами
import CatalogScreen from './screens/CatalogScreen'; // Экран каталога
import CartScreen from './screens/CartScreen'; // Экран корзины
import ContactsScreen from './screens/ContactScreen'; // Экран контактов
import ProfileScreen from './screens/ProfileScreen'; // Экран профиля
import Login from './components/Login'; // Экран логина
import Register from './components/Register'; // Экран регистрации
import AdminPanelScreen from './screens/AdminPanelScreen'; // Экран админки
import AdminUserDetailsScreen from './components/AdminUserDetails'; // Экран деталей пользователя
import AdminUsersScreen from './screens/AdminUsersScreen'; // Экран списка пользователей
import AdminOrdersScreen from './screens/AdminOrdersScreen'; // Экран заказов
import AdminProductsScreen from './screens/AdminProductsScreen'; // Экран продуктов
import AdminStatisticsScreen from './screens/AdminStatisticsScreen'; // Экран статистики
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProductDetailScreen from "./screens/ProductDetailScreen";

import axios from 'axios';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Устанавливаем токен авторизации для Axios
const setAuthToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};
setAuthToken();

// 📌 ГЛАВНАЯ НАВИГАЦИЯ (ТАБЫ)
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: "#FF6600", // Оранжевый цвет активных вкладок
      tabBarInactiveTintColor: "#777",  // Серый цвет неактивных вкладок
      tabBarStyle: { backgroundColor: "#fff" }, // Фон таб-бара белый
    }}
  >
    <Tab.Screen
      name="Каталог"
      component={CatalogScreen}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Корзина"
      component={CartScreen}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Контакты"
      component={ContactsScreen}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="call" size={24} color={color} />,
      }}
    />
    <Tab.Screen
      name="Профиль"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
      }}
    />
  </Tab.Navigator>
);

// 📌 НАВИГАЦИЯ С ВОЗМОЖНОСТЬЮ ПЕРЕХОДА НА АВТОРИЗАЦИЮ
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Главный экран с табами */}
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* Экран логина и регистрации */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        
        {/* Экран админ-панели и связанные экраны */}
        <Stack.Screen name="AdminPanel" component={AdminPanelScreen}  options={{headerShown:true, title:'Админ панель'}}/>
        <Stack.Screen name="AdminUserDetailsScreen" component={AdminUserDetailsScreen} options={{headerShown:true, title:'Пользователь'}} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen}  options={{headerShown:true, title:'Все пользователи'}} />
        <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{headerShown:true, title:'Все заказы'}}  />
        <Stack.Screen name="AdminProducts" component={AdminProductsScreen} options={{headerShown:true, title:'Все товары'}}  />
        <Stack.Screen name="AdminStatistics" component={AdminStatisticsScreen} />
        <Stack.Screen  name="ProductDetail" component={ProductDetailScreen}   options={{headerShown:true, title:'Детали'}} />
        
        {/* Экран подкатегорий и продуктов */}
        <Stack.Screen
           name="Subcategory"
          component={SubcategoryScreen}
           options={({ route }) => ({
           headerShown: true,
          title: route.params?.categoryName || 'Подкатегория', // Заголовок с параметром
           })}
/>

      
        <Stack.Screen
          name="Product"
          component={ProductScreen}
          options={({ route }) => ({
            headerShown: true,
           title: route.params?.subcategoryName || 'Подкатегория', // Заголовок с параметром
            })}
        />
       

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
