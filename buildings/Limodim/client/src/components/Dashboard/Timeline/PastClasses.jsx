import React, { useEffect, useState, useMemo } from 'react';
import api from '../../../api/api';
import PastClassesHeader from './PastClasses/PastClassesHeader';
import PastClassesFocusItem from './PastClasses/PastClassesFocusItem';
import PastClassesEmptyState from './PastClasses/PastClassesEmptyState';

const PastClasses = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [filter, setFilter] = useState('birvouz'); 

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getTimelinePastClasses();
      setRawData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch past classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const processedData = useMemo(() => {
    let data = [...rawData];

    if (filter !== 'all') {
      data = data.filter(item => item.missing && item.missing[filter]);
    }

    data.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [rawData, filter, sortOrder]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [filter, sortOrder, rawData.length]);

  const handleNext = () => {
    if (currentIndex < processedData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 font-bold animate-pulse">
        Loading classes...
      </div>
    );
  }

  return (
    <section className="bg-white p-6 rounded-3xl border border-red-50 shadow-sm h-full flex flex-col">
      <PastClassesHeader
        count={processedData.length}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        filter={filter}
        setFilter={setFilter}
      />

      <div className="flex-1 mt-6 relative">
        {processedData.length > 0 && processedData[currentIndex] ? (
          <PastClassesFocusItem
            item={processedData[currentIndex]} 
            onRefresh={fetchData}
            onNext={handleNext}
            onPrev={handlePrev}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < processedData.length - 1}
            currentIndex={currentIndex}
            total={processedData.length}
          />
        ) : (
          <PastClassesEmptyState />
        )}
      </div>
    </section>
  );
};

export default PastClasses;