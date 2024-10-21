// Slider.js
import { useState } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";

function Slider() {
  const slides = [
    {
      url: "https://imgs.boschvietnam.net/wp-content/uploads/2023/11/may-khoan-cam-tay-bosch-1-448.jpg",
    },
    {
      url: "https://www.makita.net.vn/data/ck/images/cach-lap-may-cua-xich-dung-chuan-cho-cong-viec-hieu-qua.jpg",
    },
    {
      url: "https://klvina.com/wp-content/uploads/2022/11/giay-bao-ho-tieng-anh-la-gi-01-768x572-1.jpg",
    },
    {
      url: "https://bizweb.dktcdn.net/100/400/584/files/giay-bao-ho-lao-dong-15.webp?v=1683551625507",
    },
    {
      url: "https://ducloi.com.vn/upload/images/Thang-Nh%C3%B4m-X%E1%BA%BFp.jpg",
    },
    {
      url: "https://www.thietbim5s.vn/upload/images/may-toi-dien-nhanh-500kg-stronger-cs-500_01.jpg",
    },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="w-full h-[500px] mx-auto py-16 relative group rounded-lg overflow-hidden">
      {" "}
      {/* Thay đổi chiều cao thành 500px */}
      <div
        className="w-full h-full bg-center bg-contain bg-no-repeat duration-500 rounded-lg"
        style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
      ></div>
      {/* Left Arrow */}
      <div className="hidden group-hover:block absolute top-1/2 -translate-x-0 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
        <BsChevronCompactLeft onClick={prevSlide} size={30} />
      </div>
      {/* Right Arrow */}
      <div className="hidden group-hover:block absolute top-1/2 -translate-x-0 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
        <BsChevronCompactRight onClick={nextSlide} size={30} />
      </div>
      <div className="flex justify-center py-2">
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`text-2xl cursor-pointer ${
              slideIndex === currentIndex ? "text-black" : "text-gray-500"
            }`}
          >
            <RxDotFilled />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Slider;
