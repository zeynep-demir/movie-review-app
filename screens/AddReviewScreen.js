import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Stars from 'react-native-stars';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { API_URL } from '../config';

export default function AddReviewScreen({ route, navigation }) {
  const { movieId, fetchReviews } = route.params; // Passed from MovieDetailsScreen
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  // Function to handle review submission
  const handleAddReview = async () => {
    if (!review.trim() || rating === 0) {
      Alert.alert('Error', 'Please write a review and select a rating.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      console.log("Retrieved Token:", token); // Debug token

      if (!token) {
        Alert.alert('Error', 'You must be logged in to submit a review.');
        return;
      }

      const newReview = { movieId, review, rating };
      console.log("Payload:", newReview); // Debug payload

      // Send the review to the backend
      const response = await axios.post(
        '${API_URL}/api/reviews',
        newReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Response Data:", response.data); // Debug response

      if (response.status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Your review has been added successfully.',
        });

        // Refresh reviews on the MovieDetailsScreen
        fetchReviews();
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Unexpected server response.');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      console.log('Error Details:', error.response?.data);

      const message =
        error.response?.data?.message || 'Failed to add review. Please try again later.';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Your Review</Text>

      {/* Review Input */}
      <TextInput
        style={styles.input}
        placeholder="Write your review here"
        placeholderTextColor="#aaa"
        value={review}
        onChangeText={setReview}
        multiline
      />

      {/* Rating Section */}
      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Your Rating:</Text>
        <Stars
          default={0}
          count={10} // 10-star rating system
          update={(val) => setRating(val)}
          fullStar={<Ionicons name="star" size={30} color="#FFD700" />}
          emptyStar={<Ionicons name="star-outline" size={30} color="#FFD700" />}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleAddReview}>
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </TouchableOpacity>

      {/* Toast Feedback */}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1c1c1c',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#3f51b5',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

