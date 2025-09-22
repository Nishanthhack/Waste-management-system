document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    const descriptionInput = document.getElementById('description');
    const photoInput = document.getElementById('photo');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const locationStatus = document.getElementById('locationStatus');
    const submitReportBtn = document.getElementById('submitReportBtn');
    const loadingSpinner = submitReportBtn.querySelector('.loading-spinner');
    const statusMessageDiv = document.getElementById('statusMessage');
    const photoPreview = document.getElementById('photo-preview');
    const photoPreviewContainer = document.getElementById('photo-preview-container');

    // Error message spans
    const descriptionError = document.getElementById('description-error');
    const locationError = document.getElementById('location-error');

    // Google Apps Script Web App URL
    const webAppUrl = "https://script.google.com/macros/s/AKfycbwGFen6eISnuX6e3O-0SadDM7Jact6EMAKC5r_IrPUkC4caD2Kq8Y_iPX8QIfrZrOiBFA/exec";

    let currentLatitude = null;
    let currentLongitude = null;

    // --- Photo Preview Functionality ---
    photoInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
                photoPreview.style.display = 'block';
                photoPreviewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(this.files[0]);
        } else {
            photoPreview.src = '#';
            photoPreview.style.display = 'none';
            photoPreviewContainer.style.display = 'none';
        }
    });

    // --- Geolocation Functionality ---
    getLocationBtn.addEventListener('click', () => {
        locationStatus.textContent = 'Getting your location...';
        locationError.textContent = ''; // Clear previous errors

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLatitude = position.coords.latitude;
                    currentLongitude = position.coords.longitude;
                    latitudeInput.value = currentLatitude;
                    longitudeInput.value = currentLongitude;
                    locationStatus.textContent = `Location: Lat ${currentLatitude.toFixed(5)}, Long ${currentLongitude.toFixed(5)}`;
                    locationStatus.style.color = 'var(--success-color)';
                },
                (error) => {
                    locationStatus.style.color = 'var(--error-color)';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            locationStatus.textContent = 'Location access denied. Please enable it in browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            locationStatus.textContent = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            locationStatus.textContent = 'The request to get user location timed out.';
                            break;
                        case error.UNKNOWN_ERROR:
                            locationStatus.textContent = 'An unknown error occurred while getting location.';
                            break;
                    }
                    currentLatitude = null;
                    currentLongitude = null;
                    latitudeInput.value = '';
                    longitudeInput.value = '';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            locationStatus.style.color = 'var(--error-color)';
            locationStatus.textContent = 'Geolocation is not supported by your browser.';
        }
    });

    // --- Form Submission with Google Apps Script Backend ---
    reportForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        statusMessageDiv.style.display = 'none';
        statusMessageDiv.className = 'status-message';
        descriptionError.textContent = '';
        locationError.textContent = '';

        let isValid = true;
        if (descriptionInput.value.trim() === '') {
            descriptionError.textContent = 'Please provide a description of the issue.';
            isValid = false;
        }
        if (currentLatitude === null || currentLongitude === null) {
            locationError.textContent = 'Please get your current location.';
            isValid = false;
        }

        if (!isValid) {
            statusMessageDiv.style.display = 'block';
            statusMessageDiv.classList.add('error');
            statusMessageDiv.textContent = 'Please fix the errors in the form.';
            return;
        }

        submitReportBtn.disabled = true;
        loadingSpinner.style.display = 'inline-block';
        submitReportBtn.classList.add('loading');

        const formData = new FormData();
        formData.append('description', descriptionInput.value.trim());
        formData.append('latitude', currentLatitude);
        formData.append('longitude', currentLongitude);
        formData.append('timestamp', new Date().toISOString());

        if (photoInput.files.length > 0) {
            formData.append('photo', photoInput.files[0]);
        }

        try {
            const response = await fetch(webAppUrl, {
                method: 'POST',
                body: formData,
            });

            // Google Apps Script usually returns a JSON object
            const result = await response.json();

            if (result.success) {
                statusMessageDiv.classList.add('success');
                statusMessageDiv.textContent = 'Report submitted successfully! Thank you for your contribution.';
                reportForm.reset();
                photoPreview.style.display = 'none';
                photoPreviewContainer.style.display = 'none';
                locationStatus.textContent = '';
                currentLatitude = null;
                currentLongitude = null;
            } else {
                statusMessageDiv.classList.add('error');
                statusMessageDiv.textContent = `Failed to submit report. Server message: ${result.error}`;
                console.error('Server error:', result.error);
            }
        } catch (error) {
            console.error('Network or server error:', error);
            statusMessageDiv.classList.add('error');
            statusMessageDiv.textContent = `Failed to submit report. Please check your internet connection and try again.`;
        } finally {
            submitReportBtn.disabled = false;
            loadingSpinner.style.display = 'none';
            submitReportBtn.classList.remove('loading');
            statusMessageDiv.style.display = 'block';
            statusMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
});