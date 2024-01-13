document.getElementById('productImages').addEventListener('change', handleImagePreview);

function handleImagePreview(event) {
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  imagePreviewContainer.innerHTML = ''; // Clear previous previews

  const files = event.target.files;

  for (const file of files) {
    const imageUrl = URL.createObjectURL(file);
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = file.name;
    imgElement.style.maxWidth = '100px'; // Adjust the size as needed
    imgElement.style.marginRight = '10px'; // Add some spacing between images
    imagePreviewContainer.appendChild(imgElement);
  }
}