import { View } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Path } from 'react-native-svg';

export default function CurvedBackground({ fill = '#fff' }) {
    return (
    <View className="absolute top-0 left-0 right-0 h-1/2 z-0">
        <Svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
            <Defs>
              <ClipPath id="clip">
                <Path
                  d="
                    M0,0 
                    H400 
                    V250 
                    C400,220 370,190 340,190 
                    H60 
                    C30,310 0,280 0,250 
                    Z"
                />
              </ClipPath>
            </Defs>
    
            <SvgImage
              href={require('../assets/coffees.png')}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clip)"
            />
          </Svg>
        </View>
  );
}