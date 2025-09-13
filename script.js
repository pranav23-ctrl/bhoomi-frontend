let map;
let userMarker;
let bgmAudio;
let isMuted = false;
let userName = '';
let userPhone = '';
let visitStartTime = '';
let completedCheckpoints = 0;
let currentAudioIndex = null;
let currentAudioTime = 0;
let closingSequenceTriggered = false;
const audioMarkers = [];
const finalDestination = { lat: 13.2532412, lng:80.1035785};
const feedbackApiUrl = "https://bhoomi-backend-production.up.railway.app/api/feedback";
const checkpointsData = [
  {
    title: "Padi flyover",
    latitude: 13.1020637,
    longitude: 80.1943464,
    audio: "assets/audio/1-padi-flyover.mp3"
  },
  {
    title: "Retteri Junction",
    latitude: 13.1297675,
    longitude: 80.2132127,
    audio: "assets/audio/2-retteri-junction.mp3"
  },
  {
    title: "Madavaram",
    latitude: 13.1431475,
    longitude: 80.2194264,
    audio: "assets/audio/3-madavaram.mp3"
  },
  {
    title: "Chennai Bypass Road - Starting point",
    latitude: 13.1509895,
    longitude: 80.2113691,
    audio: "assets/audio/4-chennai-bypass.mp3"
  },
  {
    title: "Puzhal",
    latitude: 13.1585651,
    longitude: 80.2035974,
    audio: "assets/audio/5-puzhal.mp3"
  },
  {
    title: "Redhills - Madavaram Junction",
    latitude: 13.1863917,
    longitude: 80.1920887,
    audio: "assets/audio/6-redhills-madavaram.mp3"
  },
  {
    title: "Revathi stores junction",
    latitude: 13.1968845,
    longitude: 80.1811593,
    audio: "assets/audio/7-revathi-stores.mp3"
  },
  {
    title: "Nallur toll",
    latitude: 13.2118031,
    longitude: 80.1711527,
    audio: "assets/audio/8-nallur-toll.mp3"
  },
  {
    title: "Karanodai bridge",
    latitude: 13.2523346,
    longitude: 80.1536141,
    audio: "assets/audio/9-karanodai-bridge.mp3"
  },
  {
    title: "Janapanchatram junction",
    latitude: 13.2605744,
    longitude: 80.1553608,
    audio: "assets/audio/10-janapanchatram.mp3"
  },
  {
    title: "Hiranandani Industrial and logistic park",
    latitude: 13.2634516,
    longitude: 80.1443299,
    audio: "assets/audio/11-hiranandani.mp3"
  },
  {
    title: "MV Properties",
    latitude: 13.2627475,
    longitude: 80.1321943,
    audio: "assets/audio/12-mv-properties.mp3"
  },
  {
    title: "Thirukandalam Village Entry",
    latitude: 13.2621542,
    longitude: 80.1239837,
    audio: "assets/audio/13-thirukandalam-entry.mp3"
  },
  {
    title: "Thirukandalam",
    latitude: 13.2627289,
    longitude: 80.1151763,
    audio: "assets/audio/14-thirukandalam.mp3"
  },
  {
    title: "200 Feet Road - Water Canal Road Junction",
    latitude: 13.1190900,
    longitude: 80.1987151,
    audio: "assets/audio/15-200feet-watercanal.mp3"
  },
  {
    title: "Kadappa Road Junction",
    latitude: 13.1355316,
    longitude: 80.1906436,
    audio: "assets/audio/16-kadappa-road.mp3"
  },
  {
    title: "Puthagaram Road",
    latitude: 13.1402551,
    longitude: 80.1911807,
    audio: "assets/audio/17-puthagaram.mp3"
  },
  {
    title: "Surapet Main Road - Ambattur - Redhills Road",
    latitude: 13.1444574,
    longitude: 80.1884291,
    audio: "assets/audio/18-surapet-road.mp3"
  },
  {
    title: "Velammal Schools & Institutions",
    latitude: 13.1500985,
    longitude: 80.1905927,
    audio: "assets/audio/19-velammal.mp3"
  },
  {
    title: "Vels Medical College & Hospital",
    latitude: 13.2668364,
    longitude: 80.1145232,
    audio: "assets/audio/20-vels-medical.mp3"
  },
  {
    title: "Sholavaram",
    latitude: 13.2259816,
    longitude: 80.1657239,
    audio: "assets/audio/21-sholavaram.mp3"
  },
  {
    title: "Telephone Exchange Point",
    latitude: 13.1014482,
    longitude: 80.1621036,
    audio: "assets/audio/22-telephone-exchange.mp3"
  },
  {
    title: "Closing Script",
    latitude: 13.2532412,
    longitude: 80.1035785,
    audio: "assets/audio/23-closing-script.mp3"
  },
  {
    title: "Koyembedu",
    latitude: 13.0687905,
    longitude: 80.2067476,
    audio: "assets/audio/24-koyembedu.mp3"
  },
  {
    title: "VR Mall, Annanagar",
    latitude: 13.0799879,
    longitude: 80.1985998,
    audio: "assets/audio/25-vr_mall.mp3"
  },
  {
    title: "Take Left Under the OverBridge",
    latitude: 13.2481505,
    longitude: 80.1525730,
    audio: "assets/audio/26-take-left.mp3"
  },
  {
    title: "Kavangarai Junction",
    latitude: 13.1707416,
    longitude: 80.1992639,
    audio: "assets/audio/27-kavangarai.mp3"
  }
];

function startTourFromCheckpoint(startFrom = 0) {
    const savedSession = JSON.parse(localStorage.getItem('tourSession')) || {};

    // Load user data from session if available
    userName = savedSession.name || '';
    userPhone = savedSession.phone || '';
    completedCheckpoints = savedSession.completedCheckpoints || 0;
    visitStartTime = savedSession.visitStartTime ? new Date(savedSession.visitStartTime) : new Date();

    // Decide which checkpoint to start from
    currentAudioIndex = savedSession.currentAudioIndex != null ? savedSession.currentAudioIndex : startFrom;
    currentAudioTime = savedSession.currentAudioTime || 0;

    // Stop any playing audios before resuming
    if (audioMarkers.length > 0) {
        audioMarkers.forEach(cp => {
            cp.audio.pause();
            cp.audio.currentTime = 0;
            cp.reached = false;
        });
    }

    // Stop BGM if playing
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
    }

    // Initialize map and markers first
initMap(() => {
    if (audioMarkers[currentAudioIndex]) {
        const audioObj = audioMarkers[currentAudioIndex].audio;
        audioObj.currentTime = currentAudioTime;

        const playAudio = () => {
            audioObj.play().catch(err => console.log("Audio resume failed:", err));
            document.removeEventListener('click', playAudio);
        };
        document.addEventListener('click', playAudio);
    }
});


    startTracking();
    startBackgroundMusic();

    // Update UI
    document.getElementById("intro").style.display = "none";
    document.getElementById("map-section").style.display = "block";
    document.getElementById("map-header").style.display = "flex";

    updateCheckpointMeter();

    // Center map based on progress
    if (completedCheckpoints > 0 && audioMarkers[completedCheckpoints - 1]) {
        const lastCP = audioMarkers[completedCheckpoints - 1].marker.getPosition();
        map.setCenter(lastCP);
    } else {
        map.setCenter({ lat: checkpointsData[0].latitude, lng: checkpointsData[0].longitude });
    }
}

function fadeAudio(audio, fromVolume, toVolume, duration = 1000) {
  const stepTime = 50; // milliseconds
  const steps = duration / stepTime;
  const volumeStep = (toVolume - fromVolume) / steps;
  let currentStep = 0;
  
  audio.volume = fromVolume;
  
  const fadeInterval = setInterval(() => {
    currentStep++;
    const newVolume = audio.volume + volumeStep;
    audio.volume = Math.min(Math.max(newVolume, 0), 1);
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      audio.volume = toVolume;
    }
  }, stepTime);
}
function updateCheckpointMeter() {
  document.getElementById("completed-count").textContent = completedCheckpoints;
  document.getElementById("total-count").textContent = checkpointsData.length;
}


document.getElementById("client-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const entryAudio = new Audio('assets/audio/Intro-Script.mp3');
  entryAudio.play().catch(e => {
    console.error("Intro audio playback failed:", e);
  });
    // Get values from form inputs
  userName = document.getElementById('name').value.trim();
  userPhone = document.getElementById('phone').value.trim();
  visitStartTime = new Date(); // store start time when tour begins

  // Show map section after intro audio starts
  document.getElementById("intro").style.display = "none";
  document.getElementById("map-section").style.display = "block";
 

  initMap();
  startTracking();
   // Show checkpoint meter and mute button
  document.getElementById("map-header").style.display = "flex";
  completedCheckpoints = 0;
  updateCheckpointMeter();
  // Start BGM only after map is initialized
  startBackgroundMusic();
  sendSMS("Started the tour to Bhoomi FarmLands");
    // Add session saving here instead of globally
  window.addEventListener("beforeunload", saveSession);

});
function clearSession() {
  localStorage.removeItem('tourSession');
}
function sendSMS(message) {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const numbers = ["+919444887887","+919444950950"];// replace with actual numbers

  const fullMessage = `Client details:\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;

  numbers.forEach(number => {
    fetch('https://bhoomi-backend-production.up.railway.app/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: fullMessage,
        to: number
      })
    }).then(response => {
      if (response.ok) {
        console.log("SMS sent to", number);
      } else {
        console.error("Failed to send SMS");
      }
    }).catch(error => {
      console.error("Error sending SMS:", error);
    });
  });
}
function startBackgroundMusic() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }
  bgmAudio = new Audio('assets/audio/background.mp3');
  bgmAudio.loop = true;
  bgmAudio.volume = 0.05;
  bgmAudio.play().then(() => {
    fadeAudio(bgmAudio, 0.05, 0.2, 2000); // Smooth fade-in
  }).catch(err => console.error("BGM playback error:", err));
}


window.onload = function() {
    const savedSession = JSON.parse(localStorage.getItem('tourSession'));

    if (savedSession && typeof savedSession.completedCheckpoints === 'number' && savedSession.completedCheckpoints < checkpointsData.length) {
        document.getElementById("resume-container").style.display = "block";
    } else {
        document.getElementById("resume-container").style.display = "none";
        localStorage.removeItem('tourSession');
    }
    document.getElementById("map-header").style.display = "none";

    // Attach event listeners here so they are always active
    document.getElementById("resume-tour").addEventListener("click", function() {
      audioMarkers.forEach(cp => { if (cp.audio && !cp.audio.paused) { cp.audio.pause(); } });
        startTourFromCheckpoint();
        document.getElementById("map-header").style.display = "flex";
        document.getElementById("resume-container").style.display = "none";
    });

    document.getElementById("start-new-tour").addEventListener("click", function() {
        audioMarkers.forEach(cp => {
            if (cp.audio) {
                cp.audio.pause();
                cp.audio.currentTime = 0;
            }
            cp.reached = false;
        });

        if (bgmAudio) {
            bgmAudio.pause();
            bgmAudio.currentTime = 0;
        }

        userName = '';
        userPhone = '';
        completedCheckpoints = 0;
        currentAudioIndex = null;
        currentAudioTime = 0;

        localStorage.removeItem('tourSession');

        document.getElementById("resume-container").style.display = "none";
        document.getElementById("intro").style.display = "block";
        document.getElementById("map-section").style.display = "none";
        document.getElementById("map-header").style.display = "none";
        updateCheckpointMeter();
    });
};



document.getElementById("toggle-mute").addEventListener("click", function() {
  isMuted = !isMuted;
  if (isMuted) {
    fadeAudio(bgmAudio, bgmAudio.volume, 0, 500);
    this.innerHTML = '<i class="fas fa-volume-mute"></i> Unmute';
  } else {
    fadeAudio(bgmAudio, bgmAudio.volume, 0.2, 500);
    this.innerHTML = '<i class="fas fa-volume-up"></i> Mute';
  }
});
document.getElementById("submit-feedback").addEventListener("click", function() {
  const feedback = document.getElementById("feedback-message").value.trim();
  if (!feedback) {
    alert("Please enter feedback before submitting.");
    return;
  }

  // Collect client info from form fields
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;

  const feedbackData = {
    name: name,
    phone: phone,
    message: feedback
  };

  // Send to backend API
  fetch('https://bhoomi-backend-production.up.railway.app/send-feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(feedbackData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Thank you for your feedback!");
      document.getElementById("feedback-form").style.display = "none";
    } else {
      alert("Failed to send feedback. Please try again.");
    }
  })
  .catch(err => {
    console.error("Error sending feedback:", err);
    alert("Error sending feedback.");
  });
});
function sendEndMessage() {
  const estimatedTime = "3-5 mins"; // or calculate dynamically
  const endTime = new Date();
  const totalTime = Math.floor((endTime - visitStartTime) / 60000) + " mins"; // in minutes
  const totalLandmarks = completedCheckpoints;

   // Format phone number with country code if not already provided
  let formattedPhone = userPhone.trim();
  if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+91" + formattedPhone;
  }
  fetch('https://bhoomi-backend-production.up.railway.app/send-end-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: userName,
      phone: formattedPhone,
      estimatedTime: estimatedTime,
      totalTime: totalTime,
      landmarksCovered: totalLandmarks
    })
  })
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      console.log("End message sent successfully!");
    } else {
      console.error("Failed to send end message:", data.error);
    }
  })
  .catch(err => console.error("Error:", err));
}

function initMap(callback) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: finalDestination,
        zoom: 14
    });

    audioMarkers.length = 0; // clear existing markers

    checkpointsData.forEach(cp => {
        const marker = new google.maps.Marker({
            position: { lat: cp.latitude, lng: cp.longitude },
            map: map,
            title: cp.title
        });

        const infoWindow = new google.maps.InfoWindow({ content: cp.title });
        marker.addListener("click", () => infoWindow.open(map, marker));

        audioMarkers.push({
            marker,
            audio: new Audio(cp.audio),
            reached: false
        });
    });

    audioMarkers.forEach((cp, index) => {
        cp.audio.addEventListener('play', () => {
            currentAudioIndex = index;
        });
        cp.audio.addEventListener('timeupdate', () => {
            currentAudioTime = cp.audio.currentTime;
            saveSession();
        });
        cp.audio.addEventListener('ended', () => {
            currentAudioIndex = null;
            currentAudioTime = 0;
            saveSession();
        });
    });

    new google.maps.Marker({
        position: finalDestination,
        map: map,
        title: "Final Destination",
        icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
    });

    if (callback) callback();
}

function saveSession() {
    const sessionData = {
        name: userName,
        phone: userPhone,
        completedCheckpoints: completedCheckpoints,
        visitStartTime: visitStartTime ? visitStartTime.toISOString() : null,
        currentAudioIndex: currentAudioIndex != null ? currentAudioIndex : null,
        currentAudioTime: (currentAudioIndex != null && audioMarkers[currentAudioIndex])
            ? audioMarkers[currentAudioIndex].audio.currentTime
            : 0  
    };
    localStorage.setItem('tourSession', JSON.stringify(sessionData));
}

function startTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const userLatLng = { lat: latitude, lng: longitude };

      if (!userMarker) {
        userMarker = new google.maps.Marker({
          position: userLatLng,
          map: map,
          title: "You are here",
          icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        });
        map.setCenter(userLatLng);
      } else {
        userMarker.setPosition(userLatLng);
      }

      // Check distance to checkpoints
      audioMarkers.forEach((cp, index) => {
        if (!cp.reached && getDistance(latitude, longitude, cp.marker.getPosition().lat(), cp.marker.getPosition().lng()) < 200) {
          cp.reached = true;
          completedCheckpoints++; // Increment here
          updateCheckpointMeter(); // Update display
          // Fade out BGM before playing checkpoint audio
          fadeAudio(bgmAudio, bgmAudio.volume, 0.05, 300);

          cp.audio.play().catch(err => console.error("Checkpoint audio error:", err));

          cp.audio.onended = () => {
            // Fade BGM back in
            if (!isMuted) {
              fadeAudio(bgmAudio, bgmAudio.volume, 0.2, 500);
            }
          };

          const infoWindow = new google.maps.InfoWindow({ content: `${cp.marker.getTitle()} Reached!` });
          infoWindow.open(map, cp.marker);

          // Check if this is checkpoint 14 (final destination)
          if (index === 22 && !closingSequenceTriggered) {
    closingSequenceTriggered = true;
    setTimeout(() => {
        alert("Congratulations! You have reached the final destination.");
        triggerClosingSequence();
        sendSMS("Client has reached the final destination.");
    }, 1000);
}

  }
});

    },
    (error) => console.error("Geolocation error:", error),
    { enableHighAccuracy: true, maximumAge: 0 }
  );
}
function triggerClosingSequence() {
    const closingAudio = new Audio('assets/audio/23-closing-script.mp3');
    closingAudio.play().catch(err => console.error("Closing audio failed:", err));

    // Send end journey SMS
    sendEndMessage();

    // Stop the BGM smoothly
    fadeAudio(bgmAudio, bgmAudio.volume, 0, 1000);
    setTimeout(() => {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
    }, 1000);

    // Hide the map and show feedback form with a transition
    document.getElementById("map-section").style.opacity = 1;
    document.getElementById("map-section").style.transition = "opacity 0.5s ease";
    document.getElementById("map-section").style.opacity = 0;

    setTimeout(() => {
        document.getElementById("map-section").style.display = "none";
        document.getElementById("feedback-form").style.display = "block";
        document.getElementById("feedback-form").style.opacity = 0;
        document.getElementById("feedback-form").style.transition = "opacity 0.5s ease";
        setTimeout(() => {
            document.getElementById("feedback-form").style.opacity = 1;
        }, 50);
    }, 500);

    // Clear session data
    clearSession();
}

// Haversine formula to get distance in meters
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
      }
