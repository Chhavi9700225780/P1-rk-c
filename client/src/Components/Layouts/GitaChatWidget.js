import React from "react";
import styled from "styled-components";

export default function GitaChatWidgetQuick({ src = "https://chhavi9700225780-my-gg-app-0lievk.streamlit.app/" }) {
  const openInNewTab = () => {
    window.open(src, "_blank", "noopener,noreferrer");
  };

  return (
    <Wrapper>
      <button
        className="chat-button"
        onClick={openInNewTab}
        title="Open GitaGPT"
        aria-label="Open GitaGPT"
      >
        <img src="https://cdn-icons-png.flaticon.com/512/4018/4018431.png" alt="GitaGPT" style={{ width: 34, height: 34 }} />
      </button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .chat-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #ff9800;
    border: none;
    box-shadow: 0 6px 18px rgba(0,0,0,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 99999;
  }

  @media (max-width: 640px) {
    .chat-button { right: 16px; bottom: 16px; }
  }
`;
