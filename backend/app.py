from flask import Flask, request, jsonify, send_from_directory
import os
import json
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, storage

service_account_info = json.loads(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON"))
cred = credentials.Certificate(service_account_info)
firebase_admin.initialize_app(
    cred,
    {
        "storageBucket": "capstone-79235.firebasestorage.app"  # Replace with your Firebase Storage bucket name
    },
)
db = firestore.client()
bucket = storage.bucket()

# Flask app
app = Flask(__name__, static_folder="vite-react-app/dist")

# Firestore collection name
collection_name = "images"


# Function to upload a file to Firebase Storage and return its URL
def upload_to_storage(file, file_name):
    blob = bucket.blob(file_name)
    blob.upload_from_file(file)
    blob.make_public()  # Make the file publicly accessible
    return blob.public_url


# Route to handle POST requests
@app.route("/upload-images", methods=["POST"])
def upload_images():
    if (
        "thermal" not in request.files
        or "rgb" not in request.files
        or "depth" not in request.files
        or "fuse" not in request.files
    ):
        return (
            jsonify(
                {"error": "All four images (thermal, rgb, depth, fuse) are required."}
            ),
            400,
        )

    # Get the uploaded files
    thermal_file = request.files["thermal"]
    rgb_file = request.files["rgb"]
    depth_file = request.files["depth"]
    fuse_file = request.files["fuse"]

    # Generate unique file names based on the current timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    thermal_file_name = f"thermal_{timestamp}.jpg"
    rgb_file_name = f"rgb_{timestamp}.jpg"
    depth_file_name = f"depth_{timestamp}.jpg"
    fuse_file_name = f"fuse_{timestamp}.jpg"

    # Upload files to Firebase Storage
    try:
        thermal_url = upload_to_storage(thermal_file, thermal_file_name)
        rgb_url = upload_to_storage(rgb_file, rgb_file_name)
        depth_url = upload_to_storage(depth_file, depth_file_name)
        fuse_url = upload_to_storage(fuse_file, fuse_file_name)
    except Exception as e:
        return jsonify({"error": f"Failed to upload images: {str(e)}"}), 500

    # Add a Firestore document with the image URLs and timestamp
    doc_id = datetime.utcnow().strftime("%H:%M:%S")
    doc_data = {
        "thermal": thermal_url,
        "rgb": rgb_url,
        "depth": depth_url,
        "fuse": fuse_url,
        "timestamp": datetime.utcnow(),  # Use UTC time for consistency
    }
    try:
        db.collection(collection_name).document(doc_id).set(doc_data)
    except Exception as e:
        return (
            jsonify({"error": f"Failed to upload document to Firestore: {str(e)}"}),
            500,
        )

    return jsonify({"message": "Images uploaded successfully", "data": doc_data}), 200


# Route to serve React app
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react_app(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")
