import React from 'react';
import './CollaboratorsSection.css';

const CollaboratorsSection = () => {
  const collaborators = ['NCC', 'NSS', 'YMCA'];

  return (
    <section className="collaborators">
      <div className="container">
        <h2 className="section-title">Our Collaborators</h2>
        <div className="collaborators-grid">
          {collaborators.map((collaborator, index) => (
            <div key={index} className="collaborator-card">
              <div className="collaborator-icon">
                {collaborator === 'NCC' && '⚔️'}
                {collaborator === 'NSS' && '🤝'}
                {collaborator === 'YMCA' && '🌟'}
              </div>
              <h3 className="collaborator-name">{collaborator}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollaboratorsSection;