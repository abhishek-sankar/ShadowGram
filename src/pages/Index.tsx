
import React from 'react';
import { Layout } from '@/components/Layout';
import { Feed } from '@/components/Feed';
import { AppProvider } from '@/contexts/AppContext';

const Index = () => {
  return (
    <AppProvider>
      <Layout>
        <Feed />
      </Layout>
    </AppProvider>
  );
};

export default Index;
