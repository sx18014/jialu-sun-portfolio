
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { WorkIndex } from './components/WorkIndex';
import { InfiniteGallery } from './components/InfiniteGallery';
import { AboutSection } from './components/AboutSection';
import { ProjectPage } from './components/ProjectPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<WorkIndex />} />
          <Route path="/work/:id" element={<ProjectPage />} />
          <Route path="/gallery" element={<InfiniteGallery />} />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/project/:id" element={<ProjectPage />} /> {/* Legacy redirect support if needed */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
