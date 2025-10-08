// Avatar Manager - Universal avatar handling across all pages
class AvatarManager {
    constructor() {
        this.defaultIcon = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'>
            <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/>
            <circle cx='12' cy='7' r='4'/>
        </svg>`;
        this.initializeAvatars();
    }

    // Get user profile data from localStorage
    getUserProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            return JSON.parse(savedProfile);
        }
        return {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Product Manager',
            team: 'Engineering',
            keywords: 'urgent, deadline, budget',
            avatar: null
        };
    }

    // Get user initials from name
    getUserInitials(name = null) {
        const profile = this.getUserProfile();
        const userName = name || profile.name || 'John Doe';
        return userName.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Update avatar in navigation
    updateNavAvatar(avatarElement) {
        if (!avatarElement) return;

        const profile = this.getUserProfile();
        
        if (profile.avatar) {
            // Show uploaded avatar image
            avatarElement.innerHTML = `<img src="${profile.avatar}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            // Show initials with gradient background
            const initials = this.getUserInitials();
            avatarElement.innerHTML = initials;
            avatarElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            avatarElement.style.color = '#ffffff';
        }
    }

    // Update profile preview avatar
    updateProfileAvatar(avatarElement) {
        if (!avatarElement) return;

        const profile = this.getUserProfile();
        
        if (profile.avatar) {
            // Show uploaded avatar image
            avatarElement.innerHTML = `<img src="${profile.avatar}" alt="Avatar" onclick="document.getElementById('avatarInput').click()">`;
        } else {
            // Show initials
            const initials = this.getUserInitials();
            avatarElement.textContent = initials;
            avatarElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            avatarElement.style.color = '#ffffff';
        }
    }

    // Save avatar data
    saveAvatar(avatarData) {
        const profile = this.getUserProfile();
        profile.avatar = avatarData;
        localStorage.setItem('userProfile', JSON.stringify(profile));
        
        // Update all avatars on current page
        this.refreshAllAvatars();
    }

    // Initialize avatars on page load
    initializeAvatars() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.refreshAllAvatars();
            });
        } else {
            this.refreshAllAvatars();
        }
    }

    // Refresh all avatars on the current page
    refreshAllAvatars() {
        // Update navigation avatar
        const navAvatar = document.getElementById('userAvatar');
        if (navAvatar) {
            this.updateNavAvatar(navAvatar);
        }

        // Update profile page avatar
        const profileAvatar = document.getElementById('avatarPreview');
        if (profileAvatar) {
            this.updateProfileAvatar(profileAvatar);
        }

        // Update any other avatar elements
        const allAvatars = document.querySelectorAll('.user-avatar, .avatar-preview');
        allAvatars.forEach(avatar => {
            if (avatar.id === 'userAvatar') {
                this.updateNavAvatar(avatar);
            } else if (avatar.id === 'avatarPreview') {
                this.updateProfileAvatar(avatar);
            }
        });
    }

    // Listen for storage changes (when avatar is updated on another tab/page)
    initStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'userProfile') {
                this.refreshAllAvatars();
            }
        });
    }
}

// Create global instance
window.avatarManager = new AvatarManager();

// Initialize storage listener
window.avatarManager.initStorageListener();