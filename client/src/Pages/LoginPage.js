// src/Pages/LoginPage.jsx
import React from "react";
import styled from "styled-components";
import AuthCard from "../Components/AuthCard";
//import logoSrc from "../assets/logo-small.png"; // optional -- replace or remove

const Page = styled.div`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #ffffff !important;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  box-sizing: border-box;
  z-index: 9999;
`;

const Column = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoWrap = styled.div`
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  width: 100%;
`;

const FooterSmall = styled.div`
  margin-top: 18px;
  color: #444;
  font-size: 13px;
  text-align: center;
`;

export default function LoginPage() {
  return (
    <Page>
      <Column>
        

        <AuthCard />

        <FooterSmall>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </FooterSmall>
      </Column>
    </Page>
  );
}
