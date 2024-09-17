"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchUserDetails } from '../utils/api';

const LoginSuccess = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { token } = router.query;
        if (typeof token === 'string') {
            fetchUserDetails(token)
                .then((userData) => {
                    setUser(userData);
                    setLoading(false);
                })
                .catch(() => {
                    router.push('/');
                });
        } else {
            router.push('/');
        }
    }, [router]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Welcome, {user?.firstname}!</h1>
        </div>
    );
};

export default LoginSuccess;
