import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function ReviewScreen({ route }) {
  const { movieId } = route.params; // movieId route parametrelerinden alınır
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!movieId) {
      console.error('No movieId provided to fetch reviews');
      return;
    }
  
    axios
      .get(`${API_URL}/reviews/${movieId}`)
      .then((response) => setReviews(response.data.reverse())) // Reverse to show latest first
      .catch((error) => {
        console.error('Error fetching reviews:', error);
        setReviews([]); // Gracefully handle errors
      });
  }, [movieId]);
  

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewAuthor}>{item.author}</Text>
      <Text style={styles.reviewRating}>
  <Ionicons name="star" size={16} color="#FFD700" /> {item.rating}/10
</Text>

      <Text style={styles.reviewText}>{item.review}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Reviews</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderReview}
        ListEmptyComponent={<Text style={styles.noReviewsText}>No reviews yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#1c1c1c',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  reviewRating: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#bbb',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 50,
  },
});
