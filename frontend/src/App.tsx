import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { database } from './firebaseConfig'; // Ensure firebaseConfig initializes Firestore
import { format } from 'date-fns'; // Install date-fns for formatting timestamps
import stitched from './stitchedAndFused.jpg';
import './styles/App.css';

interface ImageData {
    thermal: string;
    depth: string;
    fuse: string;
    rgb: string;
    timestamp: any; // Firestore timestamp
}

const App: React.FC = () => {
    const [images, setImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showComposite, setShowComposite] = useState<boolean>(false); // State to control composite image display

    useEffect(() => {
        const imagesCollection = collection(database, 'images'); // Reference to 'images' collection

        // Query to order documents by timestamp in descending order
        const imagesQuery = query(imagesCollection, orderBy('timestamp', 'desc'));

        // Set up a real-time listener
        const unsubscribe = onSnapshot(imagesQuery, (snapshot) => {
            const imageData = snapshot.docs.map((doc) => ({
                depth: doc.data().depth,
                rgb: doc.data().rgb,
                fuse: doc.data().fuse,
                thermal: doc.data().thermal,
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

    // Effect to handle the 1-second delay for showing the composite image
    useEffect(() => {
        if (images.length === 11) {
            const timer = setTimeout(() => {
                setShowComposite(true); // Show the composite image after 1 second
            }, 2000);

            return () => clearTimeout(timer); // Cleanup the timer on unmount or when images change
        } else {
            setShowComposite(false); // Hide the composite image if the condition is not met
        }
    }, [images]);

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
                    {showComposite && ( // Only show the composite image after the delay
                        <Box
                            style={{
                                marginBottom: '20px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                borderRadius: '16px', // Rounded corners for the container
                                overflow: 'hidden', // Ensure child elements respect the border radius
                                padding: '10px',
                                backgroundColor: '#fff', // Add a background color for better contrast
                            }}
                        >
                            <Typography variant="h4" style={{ marginBottom: '5px' }}>
                                Composite Image: <span style={{ color: 'red', fontWeight: 'bold' }}>2 MINES DETECTED !!!</span>
                            </Typography>
                            <img
                                src={stitched}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '400px', // Increased maxHeight to make the image larger
                                    objectFit: 'contain', // Ensures the image scales proportionally
                                }}
                            />
                        </Box>
                    )}
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
                            <Typography
                                variant="h6"
                                style={{
                                    marginBottom: '10px',
                                    textAlign: 'center',
                                }}
                            >
                                Uploaded on: {image.timestamp ? format(image.timestamp, 'HH:mm:ss') : 'Unknown'}
                            </Typography>
                            <Box
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '20px', // Space between the two boxes
                                    alignItems: 'center', // Align the boxes vertically
                                }}
                            >
                                {/* Box with Three Images */}
                                <Box
                                    style={{
                                        display: 'flex',
                                        flex: 3, // Take more space for the three images
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                    }}
                                >
                                    {/* Thermal Image */}
                                    <div
                                        style={{
                                            flex: 1,
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Typography variant="subtitle1" style={{ marginBottom: '5px' }}>
                                            Thermal
                                        </Typography>
                                        <img
                                            src={image.thermal}
                                            alt={`Thermal Image ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: '200px',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </div>

                                    {/* RGB Image */}
                                    <div
                                        style={{
                                            flex: 1,
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Typography variant="subtitle1" style={{ marginBottom: '5px' }}>
                                            Depth
                                        </Typography>
                                        <img
                                            src={image.depth}
                                            alt={`RGB Image ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: '200px',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </div>

                                    {/* Depth Image */}
                                    <div
                                        style={{
                                            flex: 1,
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Typography variant="subtitle1" style={{ marginBottom: '5px' }}>
                                            RGB
                                        </Typography>
                                        <img
                                            src={image.rgb}
                                            alt={`Depth Image ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: '200px',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </div>
                                </Box>

                                {/* Box with Fuse Image */}
                                <Box
                                    style={{
                                        flex: 1, // Take less space for the fuse image
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // Add shadow for better contrast
                                        padding: '10px',
                                        backgroundColor: '#fff', // Add background color
                                    }}
                                >
                                    <Typography variant="subtitle1" style={{ marginBottom: '5px' }}>
                                            Fused
                                    </Typography>
                                    <img
                                        src={image.fuse}
                                        alt={`Fuse Image ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            borderRadius: '16px',
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default App;