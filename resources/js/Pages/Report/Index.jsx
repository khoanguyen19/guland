import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const ReportPage = ({ auth }) => {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Báo Cáo</h2>}
        >
            <Head title="Báo Cáo" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="border rounded-lg overflow-hidden">
                                <iframe
                                    src="https://lookerstudio.google.com/embed/reporting/261090a6-54d7-4cc3-8897-2a6f0ef66832/page/tIdFF"
                                    width="100%"
                                    height="800px"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    title="Looker Studio Report"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ReportPage;
