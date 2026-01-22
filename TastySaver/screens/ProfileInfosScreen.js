import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StatusBar, TouchableOpacity, Image, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftCircleIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';
import { auth, storage } from '../firebase';
import { db } from '../firebase'; 
import { setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import { showToast } from '../components/toast';

export default function CustomHeader({ navigation, route }) {
  const {mode} = route.params;
  const isEdit = mode === 'edit';

  const [image, setImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState('');
  const [diet, setDiet] = useState('Select your diet');
  const [modalVisible, setModalVisible] = useState(false);
  const [showCuisinesModal, setShowCuisinesModal] = useState(false);

  const pickImage = async () =>{
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.5,
    });

    if(!result.canceled){
      const localUri = result.assets[0].uri;
      const response = await fetch(localUri);
      const blob = await response.blob();
      const filename = localUri.split('/').pop();

      const user = auth.currentUser;
      const imageRef = ref(storage, `avatars/${user.uid}/${filename}`);

      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      setImage(downloadURL);
    }
  }

  const uploadImageAsync = async (uri, userId) => {
  const response = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const blob = await fetch(uri).then(r => r.blob());
  const imageRef = ref(storage, `ingredient_images/${userId}_${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob);
  return await getDownloadURL(imageRef);
};


useEffect(() => {
  if (!isEdit) return;

  async function loadProfile() {
    const user = auth.currentUser;
    if (!user) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setBirth(data.birth || '');
      setGender(data.gender || '');
      setDiet(data.diet || 'Select your diet');
      setImage(data.avatar || null);
    }
  }
    loadProfile();
}, []);

const markActiveToday = async (user) => {
  if (!user) return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  let activeDays = docSnap.data().activeDays || [];

  if (!activeDays.includes(todayStr)) {
    activeDays.push(todayStr);
    if (activeDays.length > 7) {
      activeDays = activeDays.slice(-7);
    }
    await updateDoc(userRef, { activeDays });
    console.log('Active days updated:', activeDays);
  }
};


  const saveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Utilizator neautentificat');

      const next = isEdit
        ? () => navigation.goBack()
        : () => navigation.navigate('SelectCuisine');

      await setDoc(
        doc(db, 'users', user.uid),
        {
          firstName,
          lastName,
          birth,
          gender,
          diet,
          avatar: image || '',
          email: user.email,
        },
        { merge: true }
      );
      
      await markActiveToday(user);

      showToast(isEdit ? 'Profil actualizat!' : 'Profil creat cu succes!');
      next();
    } catch (error) {
      console.error('Eroare la salvare profil:', error);
      showToast('A apărut o eroare la salvare!');
    }
  };

  const handleEditCuisines = () => setShowCuisinesModal(true);


  return (
    <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{
          height: 250,
          backgroundColor: '#ae7b75',
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
          position: 'relative'
        }} />

        <View
          style={{
            position: 'absolute',
            top: 250 - 100,
            left: '50%',
            transform: [{ translateX: -100 }],
            shadowColor: '#000',
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 30 },
            shadowOpacity: 0.9,
            borderWidth: 4,
            borderColor: 'white',
            borderRadius: 100,
            overflow: 'hidden',
            width: 200,
            height: 200,
            backgroundColor: '#D9D9D9',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity onPress={pickImage}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: 200, height: 200, borderRadius: 100 }}
              />
            ) : (
              <Text style={{ color: '#888' }}>Pick image</Text>
            )}
          </TouchableOpacity>
        </View>

        <SafeAreaView className="absolute top-4 left-0 right-0 px-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="white" />
          </TouchableOpacity>

        </SafeAreaView>

        <View className="px-6 mt-36 space-y-4">
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            className="bg-white p-4 rounded-xl border border-[#5C2C1D] text-[#5C2C1D] mb-4"
          />
          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            className="bg-white p-4 rounded-xl border border-[#5C2C1D] text-[#5C2C1D] mb-4"
          />
          <TextInput
            placeholder="Birth Date (YYYY-MM-DD)"
            value={birth}
            onChangeText={setBirth}
            className="bg-white p-4 rounded-xl border border-[#5C2C1D] text-[#5C2C1D] mb-4"
          />
          <TextInput
            placeholder="Gender"
            value={gender}
            onChangeText={setGender}
            className="bg-white p-4 rounded-xl border border-[#5C2C1D] text-[#5C2C1D] mb-4"
          />
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-white p-4 rounded-xl border border-[#5C2C1D] mb-6"
          >
            <Text className="text-[#5C2C1D]">{diet}</Text>
          </TouchableOpacity>
        </View>

        {isEdit && (
          <View className="px-6 mt-6">
            <TouchableOpacity
              onPress={handleEditCuisines}
              className="border border-[#5C2C1D] rounded-full py-3 items-center mb-4"
            >
              <Text className="text-[#5C2C1D] font-semibold">
                Change your favorite cuisines
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="px-6 mt-10 space-y-6">
          <TouchableOpacity
            onPress={saveProfile} 
            className="bg-[#9CBB72] p-4 rounded-full items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5, 
            }}
          >
            <Text className="text-[#5C2C1D] font-semibold">Save profile</Text>
          </TouchableOpacity>
        </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white w-3/4 rounded-3xl p-6">
              {['Vegan', 'Vegetarian', 'Standard'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    setDiet(option);
                    setModalVisible(false);
                  }}
                  className="border border-[#5C2C1D] rounded-full py-4 mb-4"
                >
                  <Text className="text-center text-[#5C2C1D] font-semibold">{option}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-200 rounded-full py-4"
              >
                <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
            animationType="fade"
            transparent={true}
            visible={showCuisinesModal}
            onRequestClose={() => setShowCuisinesModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/40">
              <View className="bg-white w-80 rounded-3xl p-8 items-center shadow-xl">
                <Text className="text-xl font-bold text-[#5C2C1D] mb-2">Schimba bucatariile</Text>
                <Text className="text-base text-[#5C2C1D] mb-6 text-center">
                  Doresti sa modifici bucatariile favorite?
                </Text>
                <View className="flex-row w-full justify-between">
                  <TouchableOpacity
                    className="flex-1 mr-2 bg-[#e4cfc3] rounded-full py-3"
                    onPress={() => setShowCuisinesModal(false)}
                  >
                    <Text className="text-center font-semibold text-[#7e453e]">Nu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 ml-2 bg-[#5C2C1D] rounded-full py-3"
                    onPress={() => {
                      setShowCuisinesModal(false);
                      navigation.navigate('SelectCuisine', { mode: 'edit' });
                    }}
                  >
                    <Text className="text-center font-semibold text-white">Da</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
      </ScrollView>
    </View>
  );
}
