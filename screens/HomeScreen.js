import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { AuthContext } from "../AuthContext";
import { API_URL } from '../config';

// Screen size detection
const { width } = Dimensions.get("window");

const getCardDimensions = () => {
  if (width > 1200) return { cardWidth: width / 6 - 20 }; // 6 cards per row
  if (width > 768) return { cardWidth: width / 4 - 20 };  // 4 cards per row
  return { cardWidth: width / 2.5 - 20 };                // Mobile: 2.5 cards per row
};

export default function HomeScreen({ navigation }) {
  const [moviesByGenre, setMoviesByGenre] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false); // To track input focus state
  const { watchlistUpdated, setWatchlistUpdated } = useContext(AuthContext);

  const { cardWidth } = getCardDimensions();
  const cardHeight = (cardWidth / 2) * 3;

  useEffect(() => {
    fetchMoviesByGenre();
  }, [watchlistUpdated]);

  const fetchMoviesByGenre = () => {
    axios
      .get(`${API_URL}/movies/genres`)
      .then((response) => {
        setMoviesByGenre(response.data);
        setFilteredMovies(response.data);
        setWatchlistUpdated(false);
      })
      .catch((error) => console.error("Error fetching movies by genre:", error));
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredMovies(moviesByGenre); // Reset to all movies
    } else {
      const filtered = moviesByGenre.map((genre) => ({
        _id: genre._id,
        movies: genre.movies.filter((movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }));
      setFilteredMovies(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredMovies(moviesByGenre); // Reset movies to original state
  };

  const handleAddToWatchlist = async (movieId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Login Required",
          text2: "You must be signed in to add movies to your watchlist.",
        });
        return;
      }

      const response = await axios.post(
        `${API_URL}/movies/${movieId}/add-to-watchlist`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: response.data.message,
      });

      setWatchlistUpdated(true);
    } catch (error) {
      console.error("Error adding to watchlist:", error.response?.data || error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data.message || "Failed to add movie to watchlist.",
      });
    }
  };

  const renderMovieCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.movieCard, { width: cardWidth, height: cardHeight }]}
      onPress={() => navigation.navigate("MovieDetails", { movieId: item._id })}
      activeOpacity={0.8}
    >
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToWatchlist(item._id)}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
      <Image source={{ uri: item.poster }} style={styles.poster} />
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>
          {item.averageRating ? `${item.averageRating}` : "N/A"}
        </Text>
      </View>
      <Text style={styles.movieTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.movieReleaseDate}>{item.releaseDate}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.textFieldContainer,
            isInputFocused && styles.textFieldFocused,
          ]}
        >
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsInputFocused(true)} // On focus
            onBlur={() => setIsInputFocused(false)} // On blur
            onSubmitEditing={handleSearch} // Trigger search on Enter
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Genre Sections */}
      {filteredMovies.map((genre) => (
        <View key={genre._id} style={styles.genreSection}>
          <View style={styles.genreHeader}>
            <Text style={styles.genreTitle}>{genre._id}</Text>
          </View>
          <FlatList
            data={genre.movies}
            renderItem={renderMovieCard}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movieListContainer}
          />
        </View>
      ))}
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", paddingTop: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 15,
  },
  textFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 25,
    paddingHorizontal: 10,
    transition: "background-color 0.2s",
  },
  textFieldFocused: {
    backgroundColor: "#333333", // Lighter color when focused
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
    fontSize: 16,
    outlineStyle: "none",
  },
  clearButton: {
    marginLeft: 5,
  },
  searchButton: {
    backgroundColor: "#6200EE",
    padding: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
  genreSection: { marginBottom: 20 },
  genreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  genreTitle: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  movieListContainer: { 
    paddingHorizontal: 10 
  },
  movieCard: {
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    marginRight: 10,
    overflow: "hidden",
  },
  addButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
    zIndex: 1,
    borderRadius: 15,
  },
  poster: { width: "100%", height: "70%" },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  ratingText: { color: "#FFD700", marginLeft: 5 },
  movieTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  movieReleaseDate: { color: "#bbb", fontSize: 12, marginTop: 3, textAlign: "center" },
});

