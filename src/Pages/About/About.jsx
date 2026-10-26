import nightPoolImage from '../../../resources/pictures/homepage/landscape-night-pool.png'
import { getWebsiteImageUrl } from '../../services/imageService'
import './styles.css'

function About() {
  return (
    <div className="about-page">
      {/* Section 1: Hero Picture Background with "Our Story" & Title at Bottom Middle */}
      <section className="about-section-1">
        <div className="about-section-1-picture-bg">
          <img
            className="about-page-image"
            src={getWebsiteImageUrl('homepage/landscape_bathtub.png')}
            alt="Outdoor bathtub among the resort landscape"
            fetchPriority="high"
          />
        </div>
        <div className="about-section-1-overlay" />
        <div className="about-section-1-content">
          <p className="about-section-1-subtitle">OUR STORY</p>
          <h1 className="about-section-1-title">PolChat Garden Resort</h1>
        </div>
      </section>

      {/* Section 2: Story Text Content (Centered) */}
      <section className="about-section-2">
        <div className="about-section-2-container">
          <h2 className="about-section-2-heading">POL + CHAT</h2>

          <p className="about-section-2-paragraph">
            Our story began with our parents' love for nature. They spent years cultivating landscaping services and planting a wide variety of flora around our property. What started with lush greenery soon expanded into a cozy retreat featuring a classic Bahay Kubo, a fun Tree House, and an inflatable pool for quick cooling off.
          </p>

          <p className="about-section-2-paragraph">
            Seeing the joy these simple elements brought to family and friends, my brother had a bigger vision: why not turn our green sanctuary into a full-fledged resort? Encouraged by his idea, we officially launched our business in 2020, and by 2021-2022, we upgraded our simple setups with a permanent swimming pool.
          </p>

          <p className="about-section-2-paragraph about-section-2-highlight">
            Today, PolChat is fully family-owned and operated:
          </p>

          <p className="about-section-2-paragraph">
            Our Parents manage the day-to-day operations on-site, ensuring every corner of the property stays welcoming, clean, and beautiful. Whether you're looking for a peaceful getaway surrounded by nature or a fun swimming day with your loved ones, our family is here to welcome yours!
          </p>
        </div>
      </section>

      {/* Section 3: Whole Section Background Picture */}
      <section className="about-section-3">
        <div className="about-section-3-picture-box">
          <img
            className="about-page-image"
            src={getWebsiteImageUrl('homepage/day_pool_plant.png')}
            alt="Resort pool surrounded by tropical plants"
            loading="lazy"
          />
        </div>
      </section>

      {/* Section 4: Mirror of Homepage Section 5 (Row 1: Info Left / Pic Right, Row 2: Pic Left / Info Right) */}
      <section className="about-section-4">
        <div className="about-section-4-container">
          {/* Row 1: Info on Left, Picture on Right */}
          <div className="about-section-4-row about-section-4-row-1">
            <div className="about-section-4-content">
              <h2 className="about-section-4-title">DAY TOUR</h2>
              <div className="about-section-4-info-grid">
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">Our Day Tour is a relaxing way to enjoy PolChat Garden Resort. Spend the day swimming, exploring the garden, and enjoying the resort facilities. It is a great choice for family outings, birthdays, and time with friends. Guests are welcome to bring food and drinks. Grilling and dining areas are available for guests to use. Please check the current rates and available dates before your visit. Contact us to plan and reserve your Day Tour.</span>
                {/*  <span className="about-section-4-info-text">INFORMATION</span> */}
                </div>
             {/*   <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div>
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div> */}
              </div>
            </div>
            <div className="about-section-4-picture-box">
              <img
                className="about-page-image"
                src={getWebsiteImageUrl('homepage/day_hallway.png')}
                alt="A garden walkway at the resort"
                loading="lazy"
              />
            </div>
          </div>

          {/* Row 2: Picture on Left, Info on Right */}
          <div className="about-section-4-row about-section-4-row-2">
            <div className="about-section-4-picture-box">
              <img
                className="about-page-image"
                src={nightPoolImage}
                alt="Resort pool at night"
                loading="lazy"
              />
            </div>
            <div className="about-section-4-content">
              <h2 className="about-section-4-title">NIGHT TOUR</h2>
              <div className="about-section-4-info-grid">
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">Our Night Tour is a relaxing way to enjoy PolChat Garden Resort after sunset. It is a nice choice for families and friends who want to spend time together. You can unwind in the resort’s garden and gathering spaces. Ask us which facilities are included in your chosen package. Guests may bring food and drinks, and grilling areas are available. Please check the current night-tour rates and schedule before your visit. Contact us to confirm availability and make a reservation.</span>
                {/*  <span className="about-section-4-info-text">INFORMATION</span> */}
                </div>
             {/*   <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div>
                <div className="about-section-4-info-column">
                  <span className="about-section-4-info-text">INFORMATION</span>
                  <span className="about-section-4-info-text">INFORMATION</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Whole Section Background Picture */}
      <section className="about-section-5">
        <div className="about-section-5-picture-box">
          <img
            className="about-page-image"
            src={getWebsiteImageUrl('homepage/landscape_stairs.png')}
            alt="Stone steps through the resort garden"
            loading="lazy"
          />
        </div>
      </section>

      {/* Section 6: Large Picture on Left, Contact Information & Social Buttons on Right */}
      <section className="about-section-6">
        <div className="about-section-6-container">
          {/* Left: Large Picture */}
          <div className="about-section-6-picture-box">
            <img
              className="about-page-image"
              src={getWebsiteImageUrl('homepage/landscape_wooden.png')}
              alt="Wooden structures among the resort greenery"
              loading="lazy"
            />
          </div>

          {/* Right: Contact Information & Social Media Buttons */}
          <div className="about-section-6-content">
            <h2 className="about-section-6-heading">GET IN TOUCH</h2>
            <p className="about-section-6-subheading">
              Have questions, special requests, or ready to book your visit? Connect with us directly or via social media.
            </p>

            <div className="about-section-6-contact-details">
              <div className="about-section-6-contact-item">
                <span className="about-section-6-contact-label">Location:</span>
                <span className="about-section-6-contact-value">PolChat Garden, 346 Monaco Street Antipolo Calabarzon</span>
              </div>
             <div className="about-section-6-contact-item">
  <span className="about-section-6-contact-label">Phone / Mobile:</span>
  <span className="about-section-6-contact-value">
    0953 495 4389
  </span>
</div>
              <div className="about-section-6-contact-item">
                <span className="about-section-6-contact-label">Email:</span>
                <a href="mailto:polchat2k20@gmail.com" className="about-section-6-contact-link">polchat2k20@gmail.com</a>
              </div>
            </div>

            {/* Social Media Buttons to the Right */}
            <div className="about-section-6-social-group">
              <span className="about-section-6-social-title">Follow & Message Us:</span>
              <div className="about-section-6-social-buttons">
                <a
                  href="https://www.facebook.com/Polchatgarden"
                  target="_blank"
                  rel="noreferrer"
                  className="about-section-6-social-btn about-section-6-social-facebook"
                >
                  <svg className="about-section-6-social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                <a
                  href="https://www.tiktok.com/@dianaventures"
                  target="_blank"
                  rel="noreferrer"
                  className="about-section-6-social-btn about-section-6-social-tiktok"
                >
                  <svg className="about-section-6-social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.46V11.83a8.16 8.16 0 0 0 5.77 2.35v-3.44a4.85 4.85 0 0 1-3.77-1.44 4.83 4.83 0 0 1-1.23-2.61z"/>
                  </svg>
                  <span>TikTok</span>
                </a>

                <a
                  href="https://www.youtube.com/@Dianaventures"
                  target="_blank"
                  rel="noreferrer"
                  className="about-section-6-social-btn about-section-6-social-youtube"
                >
                  <svg className="about-section-6-social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
