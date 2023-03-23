import React, { useRef } from "react";
import "./Modal.css";
import useClickOutside from "../../hooks/useClickOutside";
import { AiOutlineClose } from "react-icons/ai";

const Modal = ({ 
    children, display, flex, shade, openModal, width, 
    closeModal, zIndex, text, height, position 
}) => {

    const modalRef = useRef(null);
    useClickOutside(modalRef, closeModal);

    return (
        <div className={`Modal ${display} ${flex} ${shade} ${position}`}
        style={{zIndex: (zIndex||"99999999")}}>
            <div className="Modal__Wrapper" ref={modalRef} 
            style={{width: width, height: height||"max-content"}}>
                <div className="Modal-top">
                    <h2>{text||""}</h2>
                    <AiOutlineClose className="Modal-icon svgs-black" 
                    onClick={closeModal} />
                </div>
                {children}
            </div>
        </div>
    )
}

export default Modal;