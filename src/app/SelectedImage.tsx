import { useState } from "react";

export default function SelectedImage({
  selectedImage,
  setSelectedImage
}: {
  selectedImage: string
  setSelectedImage: any
}) {
  const [imageHovered, setImageHovered] = useState<boolean>(false);

  return (
    <img
      onMouseEnter={() => setImageHovered(true)}
      onMouseLeave={() => setImageHovered(false)}
      src={selectedImage}
      alt="Selected"
      className="w-full h-full"
    />
  );
}
