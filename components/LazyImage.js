import React from 'react';
import LazyLoad from 'react-lazyload';
import { Image, StyleSheet } from 'react-native';

const LazyImage = ({ src, style }) => (
  <LazyLoad height={200} offset={100} once>
    {src ? (
      <Image
        source={{ uri: src }}
        style={style}
        resizeMode="cover"
        onError={(error) =>
          console.error(`LazyImage failed to load: ${error.nativeEvent.error}`)
        }
      />
    ) : (
      <Image
        source={{ uri: "https://via.placeholder.com/300x450" }}
        style={[style, styles.placeholder]}
        resizeMode="cover"
      />
    )}
  </LazyLoad>
);

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#ccc", // Fallback color
  },
});

export default LazyImage;
