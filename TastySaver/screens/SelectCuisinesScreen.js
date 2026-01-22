import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CuisineOption from '../components/CuisineOption';
import {auth, db} from '../firebase';
import {doc, updateDoc, collection, getDocs } from 'firebase/firestore';

export default function SelectCuisines({navigation}){

    const [cuisineOptions, setCuisineOptions] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    
    const [selected, setSelected]= useState([]);

    useEffect(() => {
        const loadCuisineOptions = async () => {
            try{
                const colRef = collection(db, 'cuisines');
                const snapshot = await getDocs(colRef);

                const options = [];
                snapshot.forEach(docSnap => {
                    const data = docSnap.data();

                    options.push({
                        id:docSnap.id,
                        name: data.name,
                        emoji: data.emoji
                    });
                });
                options.sort((a,b) => a.name.localeCompare(b.name));

                setCuisineOptions(options);
            }catch(err){
                console.warn('Eroare la incarcarea bucatariilor:', err);
            }finally{
                setIsLoadingOptions(false);
            }
        };
        loadCuisineOptions();
    }, []);

    const toggleCuisine = (cuisine) => {
        if(selected.includes(cuisine)) {
            setSelected(selected.filter(item=>item !== cuisine))
        }else if(selected.length <3 ){
            setSelected([...selected, cuisine])
        }
    };

    const saveCuisines = async () => {
        const user = auth.currentUser;
        if (user) {
            try{
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    favouriteCuisines: selected,
                });
                navigation.navigate('Home');
            }catch(err){
                console.error('Eroare la salvare: ', err);
                alert('A aparut o eroare la salvarea bucatariilor.');
            }
        }
    };

    if (isLoadingOptions) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8ede3'
      }}>
        <ActivityIndicator size="large" color="#5C2C1D" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#5C2C1D' }}>
          Se încarcă opțiunile...
        </Text>
      </View>
    );
  }

    return(
        <SafeAreaView className="flex-1 bg-[#f8ede3]">

        <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingTop: 100,
          paddingBottom: 100,
          width: '100%',
        }}
      >
            <Text className="text-3xl font-bold text-[#5C2C1D] text-center mb-10">
                🍽️ Select 3 favourite cuisines
            </Text>

            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    paddingHorizontal: 12,
                    marginTop: 20,
                    width: '100%',
                }}
                >
                {cuisineOptions.map(({ name, emoji }) => (
                <CuisineOption
                    key={name}
                    name={name}
                    emoji={emoji}
                    isSelected={selected.includes(name)}
                    onPress={toggleCuisine}
                />
                ))}
            </View>

            <TouchableOpacity
                onPress={saveCuisines}
                disabled={selected.length !== 3}
                className={`mt-6 py-4 px-10 rounded-full ${
                selected.length === 3 ? 'bg-[#9CBB72]' : 'bg-gray-400'
                }`}
                style={{marginBottom: 40}}
            >
                <Text className="text-[#5C2C1D] font-bold text-lg">Select</Text>
             </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}