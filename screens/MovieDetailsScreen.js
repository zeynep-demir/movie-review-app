import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../AuthContext';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

const MovieDetailsScreen = ({ route, navigation }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState({});
  const [reviews, setReviews] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
  }, [movieId]);

  const fetchMovieDetails = () => {
    axios
      .get(`${API_URL}/movies/${movieId}`)
      .then((response) => setMovie(response.data))
      .catch((error) => console.error('Error fetching movie details:', error));
  };

  const fetchReviews = () => {
    axios
      .get(`${API_URL}/reviews/${movieId}`)
      .then((response) => setReviews(response.data))
      .catch((error) => console.error('Error fetching reviews:', error));
  };

  const handleAddReview = () => {
    if (isAuthenticated) {
      navigation.navigate('AddReview', { movieId, fetchReviews });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'You must log in to add a review.',
        position: 'center',
        visibilityTime: 4000,
      });
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{item.userId?.username || 'Anonymous'}</Text>
        <View style={styles.reviewRatingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.reviewRating}>{item.rating}/10</Text>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.review}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Movie Header Section */}
      <View style={styles.centeredContent}>
        <View style={styles.headerSection}>
          <Image
            source={{ uri: movie.poster || 'https://via.placeholder.com/150' }}
            style={styles.poster}
          />
          <View style={styles.overlay} />
          <View style={styles.headerContent}>
            <Text style={styles.title}>{movie.title}</Text>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={20} color="#FFD700" />
              <Text style={styles.averageRating}>
                {movie.averageRating && movie.averageRating > 0
                  ? `${movie.averageRating}/10`
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About the Movie</Text>
          <Text style={styles.description}>{movie.description || 'No description available.'}</Text>
        </View>

        {/* Add Review Button */}
        <TouchableOpacity style={styles.addReviewButton} onPress={handleAddReview}>
          <Text style={styles.addReviewButtonText}>Add a Review</Text>
        </TouchableOpacity>

        {/* User Reviews Section */}
        <Text style={styles.sectionTitle}>User Reviews</Text>
        {reviews.length > 0 ? (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item._id}
            renderItem={renderReview}
            contentContainerStyle={styles.reviewsContainer}
          />
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
        )}
      </View>
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingVertical: 20,
  },
  centeredContent: {
    width: '100%',
    maxWidth: 700, // Restrict content width for web
    alignSelf: 'center',
  },
  headerSection: {
    position: 'relative',
    width: '100%',
    height: width > 1200 ? 300 : width * 0.5,
    marginBottom: 20,
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageRating: {
    color: '#FFD700',
    fontSize: 18,
    marginLeft: 5,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 22,
  },
  addReviewButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  addReviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewsContainer: {
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewAuthor: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRating: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 5,
  },
  reviewText: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 20,
  },
  noReviewsText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});

export default MovieDetailsScreen;
