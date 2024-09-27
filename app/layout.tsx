'use client';

import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Col, Container, Footer, Header, Row } from 'nhsuk-react-components';

import ConfigureAmplifyClientSide from '../components/ConfigureAmplify';
import LoginStatus from '../components/LoginStatus';

import 'nhsuk-frontend/dist/nhsuk.css';
import './styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <Authenticator.Provider>
          <ConfigureAmplifyClientSide />
          <Header serviceName='Notify'>
            <Header.Container>
              <Header.Logo href='/' />
              <Header.Content>
                <LoginStatus />
              </Header.Content>
            </Header.Container>
            <Header.Nav>
              {/* <Header.NavItem href="/conditions"> */}
              {/*  Health A-Z */}
              {/* </Header.NavItem> */}
              <Header.NavItem home href='/'>
                Home
              </Header.NavItem>
              <Header.NavDropdownMenu />
            </Header.Nav>
          </Header>
          <Container>
            <main className='nhsuk-main-wrapper' id='maincontent' role='main'>
              <Row>
                <Col width='full'>{children}</Col>
              </Row>
            </main>
          </Container>
          <Footer>
            <Footer.List>
              <Footer.ListItem href='https://www.nhs.uk/nhs-sites/'>
                NHS sites
              </Footer.ListItem>
              <Footer.ListItem href='https://www.nhs.uk/about-us/'>
                About us
              </Footer.ListItem>
              <Footer.ListItem href='https://www.nhs.uk/contact-us/'>
                Contact us
              </Footer.ListItem>
              <Footer.ListItem href='https://www.nhs.uk/about-us/sitemap/'>
                Sitemap
              </Footer.ListItem>
              <Footer.ListItem href='https://www.nhs.uk/our-policies/'>
                Our policies
              </Footer.ListItem>
            </Footer.List>
            <Footer.Copyright>© Crown copyright</Footer.Copyright>
          </Footer>
        </Authenticator.Provider>
      </body>
    </html>
  );
}
