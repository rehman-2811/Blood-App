import React from 'react';
import './CTASection.css';

const CTASection = () => {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Ready to get started?</h2>
          <a href="#donate" className="btn btn-primary cta-btn">Donate</a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;