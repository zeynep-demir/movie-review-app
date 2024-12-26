import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { API_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  const { logout, watchlistUpdated, setWatchlistUpdated } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const watchlistRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
    setWatchlistUpdated(false); // Reset watchlist trigger
  }, [watchlistUpdated]);

  const fetchProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You must be signed in to access your profile.");
        setLoading(false);
        return;
      }

      const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(profileResponse.data);

      const watchlistResponse = await axios.get(`${API_URL}/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlist(watchlistResponse.data.watchlist || []);

      const reviewsResponse = await axios.get(`${API_URL}/reviews/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviewsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      Alert.alert("Error", "Failed to fetch profile data.");
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(`${API_URL}/watchlist/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setWatchlist((prevWatchlist) =>
        prevWatchlist.filter((movie) => movie._id !== movieId)
      );

      Alert.alert("Success", "Movie removed from your watchlist.");
      setWatchlistUpdated(true); // Trigger watchlist update
    } catch (error) {
      console.error("Error removing movie:", error);
      Alert.alert("Error", "Failed to remove the movie. Please try again.");
    }
  };

  const handleLogout = () => {
    logout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "GuestHome" }],
      });
    });
  };

  const renderWatchlistItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.poster || "https://via.placeholder.com/300x450" }}
        style={styles.posterImage}
        onLoad={() => console.log("Image loaded for:", item.title)}
        onError={() =>
          console.log("Image failed to load, showing placeholder for:", item.title)
        }
      />
      <Text style={styles.movieTitle}>{item.title}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveFromWatchlist(item._id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.movieTitle ? item.movieTitle.charAt(0).toUpperCase() : "?"}
          </Text>
        </View>
        <Text style={styles.reviewMovieTitle}>{item.movieTitle || "Unknown Movie"}</Text>
      </View>
      <Text style={styles.reviewText} numberOfLines={3}>
        {item.review || "No Review"}
      </Text>
      <View style={styles.ratingSection}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating || "N/A"}/10</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Ionicons name="person-circle-outline" size={80} color="#BB86FC" />
        {profile ? (
          <>
            <Text style={styles.profileHeader}>Welcome, {profile.username}!</Text>
            <Text style={styles.profileSubtext}>Email: {profile.email}</Text>
          </>
        ) : (
          <Text style={styles.profileSubtext}>Unable to fetch profile details.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Watchlist</Text>
        <FlatList
          ref={watchlistRef}
          data={watchlist}
          renderItem={renderWatchlistItem}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Your Reviews</Text>
        <FlatList
          ref={reviewsRef}
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 10 },
  profileSection: { alignItems: "center", marginBottom: 20 },
  profileHeader: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF" },
  profileSubtext: { fontSize: 16, color: "#BBBBBB" },
  section: { marginBottom: 20 },
  header: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 10 },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    margin: 5,
    width: 120,
    aspectRatio: 2 / 3,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  posterImage: { width: "100%", height: "100%" },
  movieTitle: {
    position: "absolute",
    bottom: 10,
    left: 10,
    fontSize: 14,
    color: "#FFFFFF",
  },
  deleteButton: { position: "absolute", top: 8, right: 8, borderRadius: 12, padding: 4 },
  reviewCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    width: 250,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    backgroundColor: "#3f51b5",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  reviewMovieTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  reviewText: { color: "#BBBBBB", fontSize: 14, lineHeight: 18, marginBottom: 10 },
  ratingSection: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  ratingText: { marginLeft: 5, color: "#FFD700", fontSize: 14, fontWeight: "bold" },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF4444",
    padding: 8,
    borderRadius: 5,
  },
  logoutText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
});
