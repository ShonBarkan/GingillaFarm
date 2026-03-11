            import React, { createContext, useState, useEffect } from 'react';
            import { carrotsService } from '../api/carrotsService';


            export const AppContext = createContext();

            export const AppProvider = ({ children }) => {
                const [lang, setLang] = useState('en');
                const [dir, setDir] = useState('ltr');
                const [serverStatus, setServerStatus] = useState('checking');

                    const [carrots, setCarrots] = useState([]);

                useEffect(() => {
                    setDir(lang === 'he' ? 'rtl' : 'ltr');
                    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
                }, [lang]);

                const syncFarmData = async () => {
                    try {

carrotsService.getAll().then(res => {
    if (res && res.data) setCarrots(res.data);
}).catch(err => console.error("Error fetching carrots", err));
                        setServerStatus('online');
                    } catch (err) {
                        console.error("Farm Sync Error:", err);
                        setServerStatus('offline');
                    }
                };

                useEffect(() => {
                    syncFarmData();
                }, []);

                return (
                    <AppContext.Provider value={{ 
                        lang, setLang, dir, setDir, carrots, setCarrots, 
                        lang, setLang, dir, serverStatus, syncFarmData 
                    }}>
                        {children}
                    </AppContext.Provider>
                );
            };
