import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import './styles.css';

const projects = [
  { title: 'Project 1', image: 'project1.jpg', link: 'https://github.com/user/project1' },
  { title: 'Project 2', image: 'project2.jpg', link: 'https://github.com/user/project2' }
];

const music = [
  { title: 'Track 1', image: 'track1.jpg', link: 'https://soundcloud.com/user/track1' },
  { title: 'Track 2', image: 'track2.jpg', link: 'https://soundcloud.com/user/track2' }
];

const graphics = [
  { image: 'graphic1.jpg' },
  { image: 'graphic2.jpg' }
];

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 3 },
  desktop: { breakpoint: { max: 1024, min: 768 }, items: 2 },
  tablet: { breakpoint: { max: 768, min: 464 }, items: 1 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 }
};

const ResumeWebsite = () => {
  return (
    <div>
      <h2>Programming Projects</h2>
      <Carousel responsive={responsive}>
        {projects.map((project, index) => (
          <a key={index} href={project.link} target="_blank" rel="noopener noreferrer">
            <img src={project.image} alt={project.title} />
            <p>{project.title}</p>
          </a>
        ))}
      </Carousel>
      
      <h2>Music Projects</h2>
      <Carousel responsive={responsive}>
        {music.map((track, index) => (
          <a key={index} href={track.link} target="_blank" rel="noopener noreferrer">
            <img src={track.image} alt={track.title} />
            <p>{track.title}</p>
          </a>
        ))}
      </Carousel>
      
      <h2>Graphic Design</h2>
      <Carousel responsive={responsive}>
        {graphics.map((graphic, index) => (
          <img key={index} src={graphic.image} alt={`Graphic ${index + 1}`} />
        ))}
      </Carousel>
      
      <div id="from-left-scroll" className="hidden">
        <ul>
          <li><a href="#programming_page">Programming</a></li>
          <li><a href="#graphic_design_page">Graphic Design</a></li>
          <li><a href="#music_page">Music</a></li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeWebsite;
