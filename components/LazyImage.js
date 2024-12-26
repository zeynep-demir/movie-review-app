// LazyImage.js
import React from 'react';
import LazyLoad from 'react-lazyload';
import { Image, StyleSheet } from 'react-native';

const LazyImage = ({ src, style, placeholder }) => (
  <LazyLoad height={200} offset={100}>
    <Image
      source={{ uri: src || placeholder }}
      style={style}
      resizeMode="cover"
    />
  </LazyLoad>
);

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc', // Placeholder color
  },
});

export default LazyImage;
