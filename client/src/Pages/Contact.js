import axios from "axios";
import React, { useState } from "react";
import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useGlobalContext } from "../Context/Context";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer } from "../utils/animations";

const API = "https://gita2.onrender.com";

const Contact = () => {
  const { isdarkMode } = useGlobalContext();

  // reduced motion preference
  const reduceMotion = useReducedMotion();
  const containerVariants = reduceMotion ? { hidden: {}, visible: {} } : staggerContainer;
  const itemVariant = reduceMotion ? { hidden: {}, visible: {} } : fadeUp;

  // Additional animation variants
  const formFieldVariants = reduceMotion ? { hidden: {}, visible: {} } : {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    focus: {
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };

  const titleVariants = reduceMotion ? { hidden: {}, visible: {} } : {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const letterVariants = reduceMotion ? { hidden: {}, visible: {} } : {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = reduceMotion ? { hidden: {}, visible: {} } : {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        delay: 0.8,
        type: "spring",
        stiffness: 200
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(255, 165, 0, 0.3)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Initialize form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check for empty fields
    if (formData.name === "" || formData.email === "" || formData.message === "") {
      setIsSubmitting(false);
      return toast.error("Please fill all the Details.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: isdarkMode ? "dark" : "light",
      });
    }

    // Prepare form data
    const data = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
    };

    // Send form data to the backend
    try {
      const res = await axios.post(`${API}/contact/`, data);

      // Show success notification
      if (res.data && res.data.success === true) {
        toast.success("Thank You! Your Message has been sent sucessfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: isdarkMode ? "dark" : "light",
        });
      }

      // Clear form fields
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      // Handle error here (display an error toast, etc.)
      toast.error("There is a error in form submission", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: isdarkMode ? "dark" : "light",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Wrapper
      as={motion.section}
      className="relative contact-section"
      id="contact"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      animate="visible"   
      exit="hidden"      
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.div 
        className="custom-container p-10" 
        variants={itemVariant}
      >
        <div className="wrapper mt-32 md:mt-20">
          <motion.div 
            className="contact py-20 mx-auto justify-center items-center" 
            variants={itemVariant}
          >
            <div className="contact-wrapper flex flex-col justify-center items-center">
              <motion.div 
                className="title flex flex-col justify-center items-center mb-5" 
                variants={titleVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div>
                  <motion.h1 
                    className="orange"
                    variants={letterVariants}
                  >
                    Have 
                  </motion.h1>
                  <motion.span 
                    className="white"
                    variants={letterVariants}
                  > 
                    a Question?
                  </motion.span>
                  <br />
                  <motion.h1 
                    className="white"
                    variants={letterVariants}
                  >
                    Drop Us a
                  </motion.h1>
                  <motion.span 
                    className="orange"
                    variants={letterVariants}
                  > 
                    Line!
                  </motion.span>
                </div>
              </motion.div>

              <motion.div 
                className="contact-form" 
                variants={itemVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="wrapper">
                  <form method="post" noValidate="novalidate" autoComplete="off">
                    <div className="grid grid-cols-2 place-items-center">
                      <motion.div 
                        className="group-val" 
                        variants={formFieldVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileFocus="focus"
                        viewport={{ once: true }}
                      >
                        <motion.input
                          type="text"
                          name="name"
                          placeholder="Name*"
                          onChange={handleChange}
                          value={formData.name}
                          autoComplete="off"
                          required
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.span 
                          className="line bg-gray-300"
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          style={{ originX: 0 }}
                        />
                      </motion.div>

                      <motion.div 
                        className="group-val" 
                        variants={formFieldVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileFocus="focus"
                        viewport={{ once: true }}
                      >
                        <motion.input
                          type="email"
                          name="email"
                          placeholder="Email*"
                          onChange={handleChange}
                          value={formData.email}
                          autoComplete="off"
                          required
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.span 
                          className="line bg-gray-300"
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          style={{ originX: 0 }}
                        />
                      </motion.div>

                      <motion.div 
                        className="group-val col-span-2" 
                        variants={formFieldVariants}
                        initial="hidden"
                        whileInView="visible"
                        whileFocus="focus"
                        viewport={{ once: true }}
                      >
                        <motion.textarea
                          type="text"
                          name="message"
                          rows="10"
                          cols="40"
                          placeholder="Your Message*"
                          onChange={handleChange}
                          value={formData.message}
                          autoComplete="off"
                          required
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.span 
                          className="line bg-gray-300"
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          style={{ originX: 0 }}
                        />
                      </motion.div>
                    </div>
<motion.button
    onClick={handleSubmit}
    // 👇 Using grid is a robust way to center a single item
    className=" submit-btn col-span-1 w-30 border-2  border-orange-500 hover:bg-orange-500 pt-2 pb-2 pl-6 pr-6 my-0 mx-auto grid place-items-center rounded-md hover:scale-110 duration-300"
    variants={buttonVariants}
    initial="hidden"
    whileInView="visible"
    whileHover="hover"
    whileTap="tap"
    viewport={{ once: true }}
    disabled={isSubmitting}
    animate={isSubmitting ? { 
      scale: [1, 1.05, 1], 
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.5, repeat: Infinity }
    } : {}}
  >
    {/* Text is now directly inside the button, no span */}
    {isSubmitting ? "Submitting..." : "Submit"}
</motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Wrapper>
  );
};

export default Contact;

const Wrapper = styled.section`
  position: relative;
  width: 100vw;
  height: 100%;
  /* background-color: #faf7ed; */
  .contact .title {
    .white {
      display: inline;
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-weight: 700;
      line-height: 1.2;
      color: ${({ theme }) => theme.colors.heading.primary};
      font-size: 2.5em;
    }
    .orange {
      display: inline;
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-weight: 700;
      line-height: 1.2;
      font-size: 2.5em;
      color: ${({ theme }) => theme.colors.orange};
    }
  }
  .submit-btn {
    color: ${({ theme }) => theme.colors.heading.primary};
    &:hover {
      color: white;
    }
  }

  .contact {
    .contact-wrapper {
      .title {
        min-width: 700px;
        letter-spacing: 5px;
      }
      .contact-form {
        min-width: 375px;
        .group-val {
          width: 100%;
          padding: 15px 20px;
          input {
            width: 100%;
            padding: 1em 1.8em;
            color: ${({ theme }) => theme.colors.heading.primary};
            background-color: transparent;
            /* background-color: ${({ theme }) => theme.colors.bg.primary}; */
            /* border: 2px solid ${({ theme }) =>
              theme.colors.border_color.primary};
        border-radius: 31px; */
            transition: color 0.3s ease, background-color 0.3s ease,
              border-color 0.3s ease;
            outline: none;
            &:focus {
              outline: none;
              /* color: #694c5c;
          border-color: orange !important; */
              /* background-color: ${({ theme }) => theme.colors.bg.primary}; */
            }
            &:hover {
              border-color: ${({ theme }) => theme.colors.orange};
            }
          }

          input:hover+.line::before{
             width: 100%;
          }
          textarea:hover+.line::before{
             width: 100%;
          }

          .line {
            display: block;
            height: 1.1px;
            width: 100%;
            position: relative;
            transition: all 0.4s ease;
            z-index: 1;
            margin-top: -1px;
            &:before {
              content: "";
              display: block;
              width: 0;
              height: 1.1px;
              position: absolute;
              left: 0;
              top: 0;
              z-index: 1;
              background-color: ${({ theme }) => theme.colors.orange};
              transition: all 0.4s ease;
            }
          }

          textarea {
            width: 100%;
            height: 50px;
            resize: none;
            min-height: 45px;
            padding: 0.85em 1.8em;
            background-color: transparent;
            color: ${({ theme }) => theme.colors.heading.primary};
            /* background-color: ${({ theme }) => theme.colors.bg.primary}; */
            /* border: 2px solid ${({ theme }) =>
              theme.colors.border_color.primary};
             border-radius: 31px; */
            transition: color 0.3s ease, background-color 0.3s ease,
              border-color 0.3s ease;
            &:focus {
              outline: none;
              /* color: #694c5c;
              border-color: orange !important; */
              /* background-color: ${({ theme }) => theme.colors.bg.primary}; */
            }
            &:hover {
              border-color: orange;
            }
          }
        }
      }
    }
  }
`;