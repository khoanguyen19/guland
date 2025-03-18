import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const ReportPage = ({ auth }) => {
    const [iframeUrl, setIframeUrl] = useState('https://lookerstudio.google.com/embed/reporting/your-report-id/page/your-page-id');
    const [iframeHeight, setIframeHeight] = useState('800px');

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
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">Báo cáo phân tích dữ liệu bất động sản</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Dữ liệu được cập nhật tự động từ Looker Studio
                                </p>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <iframe
                                    src="https://lookerstudio.google.com/embed/reporting/dd529c04-6c6a-4210-8068-6cb97235c778/page/page_12345"
                                    width="100%"
                                    height={iframeHeight}
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    title="Looker Studio Report"
                                />
                                {/* <iframe width="800" height="1000" src="https://lookerstudio.google.com/embed/reporting/dd529c04-6c6a-4210-8068-6cb97235c778/page/page_12345" frameBorder="0" ></iframe> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ReportPage;
