import React, { memo } from "react";
import styled from "styled-components";
import AuthCard from "../Components/Layouts/AuthCard";

// ✅ STYLING UNTOUCHED
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

const FooterSmall = styled.div`
  margin-top: 18px;
  color: #444;
  font-size: 13px;
  text-align: center;
`;

// ✅ OPTIMIZATION: Converted to const + memo to prevent unnecessary re-renders
const LoginPage = () => {
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
};

export default memo(LoginPage);