import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore';
import SwipeToLeft from '../components/SwipeToLeft';
import {SuggestedRecipesScreen} from './SuggestedRecipesScreen';
import { useNavigation } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import { ArrowLeftCircleIcon } from 'react-native-heroicons/solid';
import AnimatedButton from '../components/AnimatedButton';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiration, setExpiration] = useState('');
  const [unit, setUnit] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const inventoryRef = query(collection(db, 'inventory'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
    });

    return () => unsubscribe();
  }, []);

  const addInventoryItem = async () => {
    const user = auth.currentUser;
    if (!user || !name || !quantity || !expiration) return;

    const newItem = {
      userId: user.uid,
      name,
      quantity,
      unit,
      expirationDate: expiration,
      addedAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'inventory'), newItem);
      setName('');
      setQuantity('');
      setExpiration('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Could not add item.');
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-4">

        <View className="relative flex-row items-center justify-center mt-3 h-12">
          <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Home' })} className="absolute left-0">
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="#5C2C1D" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-[#5C2C1D]">My Inventory</Text>
        </View>

        <FlatList
          data={inventory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeToLeft item={item} onDelete={deleteInventoryItem} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        />

          <TouchableOpacity
            onPress={() => {
              setName('');
              setQuantity('');
              setExpiration('');
              setUnit('');
              setModalVisible(true);
            }}
            className="bg-[#9CBB72] px-8 py-5 rounded-full shadow absolute bottom-24 self-center"
          >
            <Text className="text-[#5C2C1D] font-semibold text-lg">+ Add Item</Text>
          </TouchableOpacity>

          <View style={{ position: 'absolute', bottom: 10, alignSelf: 'center', width: '100%' }}>
            <AnimatedButton
              label="Let's Cook"
              onPress={() => navigation.navigate('SuggestedRecipesScreen')}
              borderColor="#996A65"
              fillColor="#996A65"
              textColor="#996A65"
              fillTextColor="#fff"
            />
          </View>

      </SafeAreaView>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-[#f8ede3] bg-opacity-50 px-4">
          <View className="bg-[#fef8f4] rounded-3xl w-full p-6 space-xl">
            <Text className="text-lg font-bold text-[#5C2C1D] text-center mb-4">Add New Item</Text>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              className="border border-[#996A65] p-3 rounded-xl mb-4 text-[#5C2C1D]"
              placeholderTextColor = "#bfa39c"
            />
            <TextInput
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              className="border border-[#996A65] p-3 rounded-xl mb-4 text-[#5C2C1D]"
              placeholderTextColor = "#bfa39c"
            />
            <View className="border border-[#996A65] p-3 rounded-xl mb-4">
              <Picker
                selectedValue={unit}
                onValueChange={(itemValue) => setUnit(itemValue)}
              >
                <Picker.Item label="Select unit..." value="" enabled={false} />
                <Picker.Item label="g (grams)" value="g" />
                <Picker.Item label="ml (milliliters)" value="ml" />
                <Picker.Item label="buc (pieces)" value="buc" />
                <Picker.Item label="kg (kilograms)" value="kg" />
                <Picker.Item label="l (liters)" value="l" />
              </Picker>
            </View>
            <TextInput
              placeholder="Expiration Date (YYYY-MM-DD)"
              value={expiration}
              onChangeText={setExpiration}
              className="border border-[#996A65] p-3 rounded-xl mb-4 text-[#5C2C1D]"
              placeholderTextColor = "#bfa39c"
            />
            <TouchableOpacity
              onPress={addInventoryItem}
              className="bg-[#996A65] py-2 rounded-xl mb-3"
            >
              <Text className="text-center text-white font-semibold text-lg">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text className="text-center text-[#ff4d4d] text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}
