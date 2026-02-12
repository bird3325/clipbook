import React from 'react';
import GlassCard from './GlassCard';
import { ApiKeyMock, BrowserMock, NotionIntegrationMock } from './GuideVisuals';

const GuideView: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto pb-20 space-y-8">
            <GlassCard className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                    </span>
                    사용자 가이드
                </h2>
                <p className="text-gray-600 mb-8">
                    Clipbook을 100% 활용하기 위한 설정 가이드입니다. AI 모델을 연결하고 Notion과 연동하여 생산성을 높여보세요.
                </p>

                <div className="space-y-12">
                    {/* 1. AI API Key Guide */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-blue-500">01.</span> AI 모델 API 키 발급
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Gemini */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Google Gemini API
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">Google의 최신 AI 모델입니다. 무료로 사용 가능합니다.</p>
                                <BrowserMock url="aistudio.google.com/app/apikey">
                                    <ApiKeyMock service="gemini" />
                                </BrowserMock>
                                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Google AI Studio</a> 접속</li>
                                    <li><strong>Get API key</strong> &gt; <strong>Create API key</strong> 클릭</li>
                                    <li>생성된 키를 복사하여 Clipbook 설정에 붙여넣기</li>
                                </ol>
                            </div>

                            {/* OpenAI */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6">
                                <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> OpenAI GPT API
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">가장 널리 사용되는 GPT 모델입니다.</p>
                                <BrowserMock url="platform.openai.com/api-keys">
                                    <ApiKeyMock service="openai" />
                                </BrowserMock>
                                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">OpenAI Dashboard</a> 접속</li>
                                    <li><strong>Create new secret key</strong> 클릭</li>
                                    <li>키(sk-...)를 복사하여 Clipbook 설정에 붙여넣기</li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* 2. Notion Integration Guide */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-blue-500">02.</span> Notion 연동 가이드
                        </h3>
                        <p className="text-sm text-gray-600 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                            ⓘ 정리된 내용을 클릭 한 번으로 내 Notion 데이터베이스에 저장할 수 있습니다.
                        </p>

                        <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-8">
                            <div className="flex flex-col gap-12">
                                <div className="w-full">
                                    <h4 className="font-bold text-gray-900 mb-2">1단계: 통합(Integration) 만들기</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">Notion 내 통합 페이지</a>에서 새 통합을 만듭니다.
                                    </p>
                                    <BrowserMock url="notion.so/my-integrations">
                                        <NotionIntegrationMock />
                                    </BrowserMock>
                                    <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                                        💡 <strong>Tip:</strong> 생성 후 <strong>시크릿 키(Internal Integration Token)</strong>를 반드시 복사해두세요.
                                    </div>
                                </div>
                                <div className="w-full">
                                    <h4 className="font-bold text-gray-900 mb-2">2단계: 데이터베이스 연결 & ID 확인</h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        연동할 데이터베이스 페이지의 <strong>[...]</strong> 메뉴에서 <strong>연결(Connect to)</strong>을 통해 방금 만든 통합을 추가합니다.
                                    </p>
                                    <BrowserMock url="notion.so/myworkspace/a8aec43384f4..." highlightId>
                                        <div className="bg-white p-8 text-center">
                                            <div className="inline-block border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
                                                <div className="text-xs text-gray-400 mb-2">Notion 데이터베이스 페이지 예시</div>
                                                <div className="h-4 w-32 bg-gray-200 rounded mb-2 mx-auto"></div>
                                                <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
                                            </div>
                                        </div>
                                    </BrowserMock>
                                    <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                                        💡 <strong>Tip:</strong> URL에서 <code>?v=</code> 앞부분의 32자리 코드가 <strong>데이터베이스 ID</strong>입니다.
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-start gap-3">
                                <span className="text-green-600 mt-0.5">✅</span>
                                <div>
                                    <p className="text-sm font-bold text-green-800">설정 완료</p>
                                    <p className="text-xs text-green-700 mt-1">
                                        설정 메뉴에 <strong>시크릿 키</strong>와 <strong>데이터베이스 ID</strong>를 입력하고 저장하세요.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </GlassCard>
        </div>
    );
};

export default GuideView;
