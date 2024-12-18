import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { API_URL } from '../config';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

// Responsive card layout
const { width } = Dimensions.get("window");

const getCardDimensions = () => {
  if (width > 1200) return { cardWidth: width / 6 - 20 }; // 6 cards per row
  if (width > 768) return { cardWidth: width / 4 - 20 };  // 4 cards per row
  return { cardWidth: width / 2.5 - 20 };                // 2.5 cards per row
};

export default function GuestHomeScreen({ navigation }) {
  const [moviesByGenre, setMoviesByGenre] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMoviesByGenre, setFilteredMoviesByGenre] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { cardWidth } = getCardDimensions();
  const cardHeight = (cardWidth / 2) * 3; // Maintain a 2:3 ratio for posters

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    axios
      .get("${API_URL}/api/movies/genres")
      .then((response) => {
        setMoviesByGenre(response.data);
        setFilteredMoviesByGenre(response.data);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setErrorMessage("Failed to load movies. Please try again later.");
      });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredMoviesByGenre(moviesByGenre);
      setErrorMessage("");
      return;
    }

    const filteredGenres = moviesByGenre.map((genre) => ({
      ...genre,
      movies: genre.movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }));

    const hasResults = filteredGenres.some((genre) => genre.movies.length > 0);
    setFilteredMoviesByGenre(hasResults ? filteredGenres : []);
    setErrorMessage(hasResults ? "" : "No such movie found.");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredMoviesByGenre(moviesByGenre);
    setErrorMessage("");
  };

  const handleWatchlistClick = () => {
    Toast.show({
      type: "error",
      text1: "Login Required",
      text2: "You must log in to add movies to your watchlist.",
      position: "center",
      visibilityTime: 4000,
    });
  };

  const renderMovieCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.movieCard, { width: cardWidth, height: cardHeight }]}
      onPress={() => navigation.navigate("MovieDetails", { movieId: item._id })}
    >
      <TouchableOpacity
        style={styles.addButton}
        onPress={(e) => {
          e.stopPropagation();
          handleWatchlistClick();
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
      <Image
        source={{ uri: item.poster || "https://via.placeholder.com/150" }}
        style={styles.poster}
      />
      <View style={styles.ratingContainer}>
        <MaterialIcons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{item.averageRating || "N/A"}</Text>
      </View>
      <Text style={styles.movieTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.movieReleaseDate}>{item.releaseDate}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.textFieldContainer,
            isInputFocused && styles.textFieldFocused,
          ]}
        >
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a movie"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onSubmitEditing={handleSearch} // Trigger search on Enter
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

      {/* Genre Sections */}
      {filteredMoviesByGenre.map((genre) => (
        <View key={genre._id} style={styles.genreSection}>
          <Text style={styles.genreTitle}>{genre._id}</Text>
          <FlatList
            data={genre.movies}
            renderItem={renderMovieCard}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ))}

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212", 
    paddingTop: 10 
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 15,
  },
  textFieldContainer: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 25,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  textFieldFocused: {
    backgroundColor: "#333333", // Lighter background on focus
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
    fontSize: 16,
    outlineStyle: "none",
  },
  clearButton: { 
    marginLeft: 5 
  },
  searchButton: {
    backgroundColor: "#6200EE",
    padding: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
  errorMessage: { 
    color: "red", 
    textAlign: "center", 
    marginBottom: 10 
  },
  genreSection: { 
    marginBottom: 20 
  },
  genreTitle: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold", 
    marginLeft: 10, 
    marginBottom: 5,
  },
  movieCard: {
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  addButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    zIndex: 1,
    borderRadius: 15,
  },
  poster: { 
    width: "100%", 
    height: "70%" 
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  ratingText: { 
    color: "#FFD700", 
    marginLeft: 5 
  },
  movieTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  movieReleaseDate: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "center",
    marginTop: 3,
  },
});
