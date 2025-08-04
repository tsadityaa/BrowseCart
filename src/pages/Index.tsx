import React, { useState, useEffect } from 'react';
import { MapPin, Search, Plus, Store, Sparkles, ShoppingBag, Heart, Users } from 'lucide-react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import ProfilePage from '../components/ProfilePage';
import AboutPage from '../components/AboutPage';
import ReviewsPage from '../components/ReviewsPage';
import ShopCard from '../components/ShopCard';
import ShopDetails from '../components/ShopDetails';
import CreateShop from '../components/CreateShop';
import EditShop from '../components/EditShop';
import SearchModal from '../components/SearchModal';
import { Shop, UserLocation } from '../types';
import { useShopsApi } from '../hooks/useShopsApi';
import { calculateDistance } from '../utils/distance';
import { useAuth } from '../hooks/useAuth';

const Index = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'profile' | 'about' | 'reviews'>('home');
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [watchId, setWatchId] = useState<number | null>(null);

  // Use the new authentication system
  const { getCurrentUserId } = useAuth();
  const currentUserId = getCurrentUserId();

  // Use the new API hook
  const { 
    shops, 
    isLoading, 
    error, 
    useApi, 
    loadNearbyShops, 
    createShop, 
    updateShop, 
    deleteShop 
  } = useShopsApi(currentUserId);

  // Get user's shops
  const userShops = shops.filter(shop => shop.createdBy === currentUserId);

  useEffect(() => {
    startLocationTracking();
    
    // Cleanup function to stop watching location when component unmounts
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      filterNearbyShops();
    }
  }, [userLocation, shops]);

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 
      };

      const successCallback = (position: GeolocationPosition) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        
        if (!userLocation || 
            calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              newLocation.latitude, 
              newLocation.longitude
            ) > 0.01) {
          setUserLocation(newLocation);
          console.log('Location updated:', newLocation);
        }
        
        setLocationPermission('granted');
      };

      const errorCallback = (error: GeolocationPositionError) => {
        console.error('Location tracking error:', error);
        setLocationPermission('denied');
        // Use default location (e.g., city center)
        setUserLocation({
          latitude: 40.7128,
          longitude: -74.0060
        });
      };

      // Start watching position for real-time updates
      const id = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
      );
      
      setWatchId(id);
    }
  };

  const requestLocation = () => {
    // Stop current watching if any
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    // Restart location tracking
    startLocationTracking();
  };

  const filterNearbyShops = async () => {
    if (!userLocation) return;
    
    if (useApi) {
      try {
        const nearby = await loadNearbyShops(userLocation);
        setNearbyShops(nearby);
      } catch (err) {
        console.error('Error loading nearby shops:', err);
        // Fallback to local filtering
        const nearby = shops.filter(shop => {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            shop.location.latitude,
            shop.location.longitude
          );
          return distance <= 2; // 2km radius
        });
        setNearbyShops(nearby);
      }
    } else {
      const nearby = shops.filter(shop => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          shop.location.latitude,
          shop.location.longitude
        );
        return distance <= 2; // 2km radius
      });
      setNearbyShops(nearby);
    }
  };

  const handleCreateShop = async (newShop: Omit<Shop, 'id'>) => {
    try {
      await createShop(newShop);
      setShowCreateShop(false);
    } catch (err) {
      console.error('Error creating shop:', err);
      // Could add toast notification here
    }
  };

  const handleUpdateShop = async (updatedShop: Shop) => {
    try {
      const updated = await updateShop(updatedShop);
      setEditingShop(null);
      setSelectedShop(updated); 
    } catch (err) {
      console.error('Error updating shop:', err);

    }
  };

  const handleDeleteShop = async (shopId: string) => {
    if (window.confirm('Are you sure you want to delete this shop?')) {
      try {
        await deleteShop(shopId);
      } catch (err) {
        console.error('Error deleting shop:', err);
        // Could add toast notification here
      }
    }
  };

  const handleToggleShopStatus = async (shopId: string, isOpen: boolean) => {
    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      try {
        await updateShop({ ...shop, isOpen });
      } catch (err) {
        console.error('Error updating shop status:', err);
        // Could add toast notification here
      }
    }
  };

  const handleNavigate = (page: 'home' | 'profile' | 'about' | 'reviews') => {
    setCurrentPage(page);
    setSelectedShop(null);
    setEditingShop(null);
    setShowCreateShop(false);
    setShowSearch(false);
  };

  if (editingShop) {
    return (
      <div>
        <Navbar 
          currentUserId={currentUserId}
          userShopsCount={userShops.length}
          onNavigate={handleNavigate}
          onCreateShop={() => setShowCreateShop(true)}
          currentPage={currentPage}
        />
        <EditShop 
          shop={editingShop}
          onUpdateShop={handleUpdateShop}
          onCancel={() => setEditingShop(null)}
        />
      </div>
    );
  }

  if (selectedShop) {
    return (
      <div>
        <Navbar 
          currentUserId={currentUserId}
          userShopsCount={userShops.length}
          onNavigate={handleNavigate}
          onCreateShop={() => setShowCreateShop(true)}
          currentPage={currentPage}
        />
        <ShopDetails 
          shop={selectedShop} 
          onBack={() => setSelectedShop(null)} 
          onEditShop={selectedShop.createdBy === currentUserId ? setEditingShop : undefined}
          userLocation={userLocation} 
        />
      </div>
    );
  }

  if (showCreateShop) {
    return (
      <div>
        <Navbar 
          currentUserId={currentUserId}
          userShopsCount={userShops.length}
          onNavigate={handleNavigate}
          onCreateShop={() => setShowCreateShop(true)}
          currentPage={currentPage}
        />
        <CreateShop 
          onCreateShop={handleCreateShop} 
          onCancel={() => setShowCreateShop(false)}
          userLocation={userLocation}
        />
      </div>
    );
  }

  // Render different pages based on navigation
  if (currentPage === 'profile') {
    return (
      <div>
        <Navbar 
          currentUserId={currentUserId}
          userShopsCount={userShops.length}
          onNavigate={handleNavigate}
          onCreateShop={() => setShowCreateShop(true)}
          currentPage={currentPage}
        />
        <ProfilePage
          currentUserId={currentUserId}
          userShops={userShops}
          onEditShop={setEditingShop}
          onDeleteShop={handleDeleteShop}
          onViewShop={setSelectedShop}
          onToggleShopStatus={handleToggleShopStatus}
        />
      </div>
    );
  }

  if (currentPage === 'about') {
    return (
      <div>
        <Navbar 
          currentUserId={currentUserId}
          userShopsCount={userShops.length}
          onNavigate={handleNavigate}
          onCreateShop={() => setShowCreateShop(true)}
          currentPage={currentPage}
        />
        <AboutPage />
      </div>
    );
  }

  if (currentPage === 'reviews') {
    return (
      <div>
        <Navbar 
          currentUserId={currentUserId}
          userShopsCount={userShops.length}
          onNavigate={handleNavigate}
          onCreateShop={() => setShowCreateShop(true)}
          currentPage={currentPage}
        />
        <ReviewsPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <Navbar 
        currentUserId={currentUserId}
        userShopsCount={userShops.length}
        onNavigate={handleNavigate}
        onCreateShop={() => setShowCreateShop(true)}
        currentPage={currentPage}
      />
      
      {/* Location Status & Track Button */}
      <div className="px-4 py-4 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <MapPin size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-800">
                {locationPermission === 'granted' 
                  ? `${nearbyShops.length} shops nearby`
                  : 'Location access required'
                }
              </span>
              <p className="text-xs text-gray-500">
                {useApi 
                  ? `Connected to MongoDB ${locationPermission === 'granted' ? '• Live tracking • Within 2km radius' : ''}`
                  : `Using demo data ${locationPermission === 'granted' ? '• Live tracking • Within 2km radius' : ''}`
                }
                {isLoading && ' • Loading...'}
                {error && ' • Error occurred'}
              </p>
            </div>
          </div>
          {locationPermission === 'denied' && (
            <button 
              onClick={requestLocation}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Enable Location
            </button>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl">
              <img 
                src="https://pplx-res.cloudinary.com/image/upload/v1751303563/gpt4o_images/jvidxt3mftinprm4e3g6.png" 
                alt="BrowseCart" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 leading-tight">
            Discover Local
            <br />
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              What’s Around You
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
            Find amazing products and services in your neighborhood with just a few clicks
          </p>
          
          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
              <button
                onClick={() => setShowSearch(true)}
                className="group w-full flex items-center px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Search size={20} className="mr-3" />
                <span className="flex-1 text-left text-lg font-medium">Search shops & products...</span>
              </button>
            </div>
          </div>

          {/* Features Images Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop" 
                alt="Local shopping" 
                className="w-full h-64 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Local Shopping</h3>
                <p className="text-sm opacity-90">Discover What's Around You</p>
              </div>
            </div>
            
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop" 
                alt="Community" 
                className="w-full h-64 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Community First</h3>
                <p className="text-sm opacity-90">Support local businesses</p>
              </div>
            </div>
            
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop" 
                alt="Easy discovery" 
                className="w-full h-64 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">Easy Discovery</h3>
                <p className="text-sm opacity-90">Find what you need quickly</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="mb-16">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">About BrowseCart</h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl">
              BrowseCart is your modern gateway to discovering the best local shops, unique products, and passionate small businesses around you.<br />
              Our mission is to empower community commerce and help you connect with neighborhood treasures in a few effortless taps.
            </p>
            <ul className="flex flex-col md:flex-row gap-3 md:gap-8 justify-center mb-2 list-none p-0">
              <li className="flex items-center gap-2 text-base text-blue-600 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                Find local shops near you
              </li>
              <li className="flex items-center gap-2 text-base text-purple-600 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400"></span>
                Support your community & creators
              </li>
              <li className="flex items-center gap-2 text-base text-pink-500 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-pink-400"></span>
                Quick & easy shopping experiences
              </li>
            </ul>
          </div>
        </section>

        {/* Enhanced Shops Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Store size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {locationPermission === 'granted' ? 'Nearby Shops' : 'Featured Shops'}
                </h2>
                <p className="text-lg text-gray-600">
                  {locationPermission === 'granted' 
                    ? 'Discover shops in your area' 
                    : 'Explore local businesses'
                  }
                </p>
              </div>
            </div>
          </div>
          
          {(locationPermission === 'granted' ? nearbyShops : shops).length === 0 ? (
            <div className="text-center py-32">
              <div className="relative mb-12">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full"></div>
                </div>
                <Store size={80} className="relative z-10 mx-auto text-gray-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {locationPermission === 'granted' ? 'No nearby shops found' : 'No shops available yet'}
              </h3>
              
              <p className="text-lg text-gray-600 mb-12 max-w-lg mx-auto">
                {locationPermission === 'granted' 
                  ? 'Be the first to create a shop in your area and help build the community!'
                  : 'Start building your local marketplace by creating the first shop!'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(locationPermission === 'granted' ? nearbyShops : shops).map((shop, index) => (
                <div 
                  key={shop.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ShopCard
                    shop={shop}
                    userLocation={userLocation}
                    onClick={() => setSelectedShop(shop)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Search Modal */}
      {showSearch && (
        <SearchModal
          shops={shops}
          onSelectShop={setSelectedShop}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

export default Index;
