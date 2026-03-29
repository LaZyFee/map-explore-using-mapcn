export const mockData = {
    user: { id: 'user', lat: 22.3569, lng: 91.7832, name: 'You', type: 'user' },
    shops: [
        { id: 'shop1', lat: 22.3700, lng: 91.7980, name: 'Coffee Corner', type: 'shop' },
        { id: 'shop2', lat: 22.3450, lng: 91.8100, name: 'Book Haven', type: 'shop' },
        { id: 'shop3', lat: 22.3620, lng: 91.7650, name: 'Tech Store', type: 'shop' },
    ],
    riders: [
        { id: 'rider1', lat: 22.3530, lng: 91.7750, name: 'Rider Mike', type: 'rider', status: 'available' },
        { id: 'rider2', lat: 22.3480, lng: 91.7900, name: 'Rider Sarah', type: 'rider', status: 'busy' },
        { id: 'rider3', lat: 22.3650, lng: 91.8020, name: 'Rider John', type: 'rider', status: 'available' },
    ],
    route: {
        from: { lat: 22.3569, lng: 91.7832 },
        to: { lat: 22.3700, lng: 91.7980 },
        waypoints: [{ lat: 22.3450, lng: 91.8100 }],
    }
};