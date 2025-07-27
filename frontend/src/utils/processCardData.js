const processCardData = (card, currentTime) => {
  // Initialize with default values
  const result = {
    lowestPrice: null,
    timeInfo: null,
    bestOffer: null,
    ...card
  };

  // Process ratings and prices together
  if (card.services?.length) {
    let totalScore = 0;
    let lowestPrice = Infinity;

    for (const service of card.services) {
      if (!service.subServices?.length) continue;
      
      for (const subService of service.subServices) {
        // Check for lowest price
        if (subService.price !== undefined && subService.price < lowestPrice) {
          lowestPrice = subService.price;
        }
      }
    }

    // Set lowest price
    result.lowestPrice = lowestPrice === Infinity ? null : lowestPrice;
  }

  // Process timings
  if (card.timings?.length) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[currentTime.getDay()];
  const todayTiming = card.timings.find(t => t.day === today);

  if (todayTiming && !todayTiming.isClosed) {
    const parseTime = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
      if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
      return totalMinutes;
    };

    const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const openTime = parseTime(todayTiming.opens);
    const closeTime = parseTime(todayTiming.closes);

    // Always include timeInfo with closingTime
    result.timeInfo = {
      isOpen: currentTotalMinutes >= openTime && currentTotalMinutes < closeTime,
      remainingMinutes: currentTotalMinutes >= openTime && currentTotalMinutes < closeTime
        ? closeTime - currentTotalMinutes
        : 0,
      closingTime: todayTiming.closes,
    };
  }
}


  // Process offers
  if (card.offers?.length) {
    let bestOffer = card.offers[0];
    for (let i = 1; i < card.offers.length; i++) {
      if (card.offers[i].discountValue > bestOffer.discountValue) {
        bestOffer = card.offers[i];
      }
    }
    result.bestOffer = bestOffer;
  }

  return result;
};
export default processCardData;