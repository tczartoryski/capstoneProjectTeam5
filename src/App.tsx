import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { database } from './firebaseConfig'; // Ensure firebaseConfig initializes Firestore
import { format } from 'date-fns'; // Install date-fns for formatting timestamps
import './styles/App.css';

interface ImageData {
    url: string;
    timestamp: any; // Firestore timestamp
}

const App: React.FC = () => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const imagesCollection = collection(database, 'images'); // Reference to 'images' collection

        // Query to order documents by timestamp in descending order
        const imagesQuery = query(imagesCollection, orderBy('timestamp', 'desc'));

        // Set up a real-time listener
        const unsubscribe = onSnapshot(imagesQuery, (snapshot) => {
            const imageData = snapshot.docs.map((doc) => ({
                url: doc.data().url,
                timestamp: doc.data().timestamp?.toDate(), // Convert Firestore timestamp to JS Date
            }));
            setImages(imageData);
            setLoading(false); // Stop loading once data is fetched
        }, (error) => {
            console.error('Error fetching images:', error);
            setImages([]); // Set to empty array on error
            setLoading(false);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);

    return (
        <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '20px' }}>
            <Typography variant="h3" gutterBottom>
                Team 5 Drone Assisted Mine Detection
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : images.length === 0 ? (
                <Typography variant="h6" color="textSecondary">
                    No Images Available At The Moment
                </Typography>
            ) : (
                <Box>
                    {images.map((image, index) => (
                        <Box
                            key={index}
                            style={{
                                marginBottom: '20px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                borderRadius: '16px', // Rounded corners for the container
                                overflow: 'hidden', // Ensure child elements respect the border radius
                                padding: '10px',
                                backgroundColor: '#fff', // Add a background color for better contrast
                            }}
                        >
                            <div
                                style={{
                                    borderRadius: '16px', // Rounded corners for the image container
                                    overflow: 'hidden', // Ensure the image respects the border radius
                                }}
                            >
                                <img
                                    src={image.url}
                                    alt={`Image ${index + 1}`}
                                    style={{
                                        width: '100%', // Ensure the image fits the container width
                                        height: 'auto', // Maintain aspect ratio
                                        maxHeight: '400px', // Optional: Limit the height of the image
                                        objectFit: 'contain', // Ensure the image fits nicely within the container
                                    }}
                                />
                            </div>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                style={{
                                    marginTop: '10px',
                                    textAlign: 'center',
                                }}
                            >
                                Uploaded on: {image.timestamp ? format(image.timestamp, 'HH:mm:ss') : 'Unknown'}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default App;