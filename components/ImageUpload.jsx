import React from "react";

const ImageUpload = (props) => {
  const { onChange, property, record } = props;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("images", e.target.files[0]);

      fetch("/upload-image", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.imageUrls && data.imageUrls.length > 0) {
            // Update the record with the URL of the uploaded image
            onChange(property.name, data.imageUrls[0]);
          }
        })
        .catch((error) => console.error("Error uploading image:", error));
    }
  };

  return (
    <div>
      <label>{property.label}</label>
      {record.params.featuredImage && (
        <img
          src={`http://localhost:5000/uploads/${record.params.featuredImage}`}
          alt="featured"
          style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
        />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};

export default ImageUpload;
