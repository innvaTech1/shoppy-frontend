import { useState } from "react";
import OrderForm from "./OrderForm";

export default function Modal({ addToCard, product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => {
    setIsModalOpen(true);
    addToCard();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className=" mb-[20px] flex items-center justify-center">
      <button
        onClick={handleOpenModal}
        className="w-full py-2 bg-green-500 text-white text-xl rounded"
      >
        Order Now
      </button>
      <OrderForm isOpen={isModalOpen} onClose={handleCloseModal} product={product} />
    </div>
  );
}
