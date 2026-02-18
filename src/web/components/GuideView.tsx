import React from 'react';
import GlassCard from './GlassCard';
import { ApiKeyMock, BrowserMock, NotionIntegrationMock } from './GuideVisuals';

const GuideView: React.FC = () => {
    return (
        <div className="w-full max-w-5xl mx-auto pb-24 space-y-10">
            <GlassCard className="p-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                    </span>
                    사용자 가이드
                </h2>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed border-b border-gray-100 pb-8">
                    Clipbook을 100% 활용하기 위한 설정 가이드입니다. <br />AI 모델을 연결하고 Notion과 연동하여 진정한 생산성 향상을 경험해보세요.
                </p>

                <div className="space-y-16">
                    {/* 1. AI API Key Guide */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-bold">01</span>
                            AI 모델 API 키 발급
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Gemini */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-7 hover:border-blue-200 transition-colors">
                                <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Google Gemini API
                                </h4>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">Google의 최신 AI 모델입니다. <br />현재 무료로 사용 가능하며 빠른 속도를 제공합니다.</p>
                                <BrowserMock url="aistudio.google.com/app/apikey">
                                    <ApiKeyMock service="gemini" />
                                </BrowserMock>
                                <ol className="list-decimal list-inside text-sm text-gray-800 space-y-3 mt-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline decoration-blue-200 hover:decoration-blue-600 font-bold">Google AI Studio</a> 접속</li>
                                    <li>좌측 상단 <strong>Get API key</strong> 클릭</li>
                                    <li><strong>Create API key</strong> 버튼 클릭</li>
                                    <li>생성된 키를 복사하여 설정에 붙여넣기</li>
                                </ol>
                            </div>

                            {/* OpenAI */}
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-7 hover:border-green-200 transition-colors">
                                <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> OpenAI GPT API
                                </h4>
                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">가장 널리 사용되는 GPT 모델입니다. <br />높은 정확도의 요약 성능을 자랑합니다.</p>
                                <BrowserMock url="platform.openai.com/api-keys">
                                    <ApiKeyMock service="openai" />
                                </BrowserMock>
                                <ol className="list-decimal list-inside text-sm text-gray-800 space-y-3 mt-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-blue-600 underline decoration-blue-200 hover:decoration-blue-600 font-bold">OpenAI Dashboard</a> 접속</li>
                                    <li><strong>Create new secret key</strong> 클릭</li>
                                    <li>키 이름 입력 후 생성</li>
                                    <li>키(sk-...)를 복사하여 설정에 붙여넣기</li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* 2. Notion Integration Guide */}
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-sm font-bold">02</span>
                            Notion 연동 가이드
                        </h3>
                        <p className="text-sm text-gray-900 mb-8 bg-blue-50 p-5 rounded-xl border border-blue-100 leading-relaxed flex items-start gap-3">
                            <span className="text-blue-600 mt-0.5 text-lg">ⓘ</span>
                            <span>정리된 내용을 클릭 한 번으로 내 Notion 데이터베이스에 저장할 수 있습니다. <br />개인 노트나 팀 워크스페이스에 자동으로 지식을 축적하세요.</span>
                        </p>

                        <div className="bg-white border border-gray-200 rounded-3xl p-10 space-y-12 shadow-sm">
                            <div className="flex flex-col gap-12">
                                <div className="w-full">
                                    <h4 className="font-bold text-gray-900 mb-3 text-lg">1단계: 통합(Integration) 만들기</h4>
                                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                                        <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-blue-600 underline decoration-blue-200 hover:decoration-blue-600 font-bold">Notion 내 통합 페이지</a>에서 새 통합을 만듭니다.
                                        <br />이름은 'ClipBook' 등으로 자유롭게 설정하세요.
                                    </p>
                                    <BrowserMock url="notion.so/my-integrations">
                                        <NotionIntegrationMock />
                                    </BrowserMock>
                                    <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        💡 <strong>Tip:</strong> 생성 후 <strong>시크릿 키(Internal Integration Token)</strong>를 반드시 복사해두세요. 'secret_'으로 시작합니다.
                                    </div>
                                </div>
                                <div className="w-full">
                                    <h4 className="font-bold text-gray-900 mb-3 text-lg">2단계: 데이터베이스 연결 & ID 확인</h4>
                                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                                        연동할 데이터베이스 페이지의 우측 상단 <strong>[...]</strong> 메뉴에서 <br />
                                        <strong>연결(Connect to)</strong> 항목을 찾아 방금 만든 통합을 선택하여 추가합니다.
                                    </p>
                                    <BrowserMock url="notion.so/myworkspace/a8aec43384f4..." highlightId>
                                        <div className="bg-white p-8 text-center">
                                            <div className="inline-block border border-gray-200 rounded-xl p-6 shadow-sm bg-gray-50">
                                                <div className="text-xs text-gray-500 mb-3">Notion 데이터베이스 페이지 예시</div>
                                                <div className="h-4 w-32 bg-gray-200 rounded mb-3 mx-auto"></div>
                                                <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
                                            </div>
                                        </div>
                                    </BrowserMock>
                                    <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        💡 <strong>Tip:</strong> 브라우저 주소창 URL에서 <code>?v=</code> 앞부분의 32자리 코드가 <strong>데이터베이스 ID</strong>입니다.
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-start gap-4">
                                <span className="text-green-600 mt-0.5 text-xl">✅</span>
                                <div>
                                    <p className="text-base font-bold text-green-900">설정 완료</p>
                                    <p className="text-sm text-green-800 mt-2 leading-relaxed">
                                        이제 환경 설정 메뉴에 <strong>시크릿 키</strong>와 <strong>데이터베이스 ID</strong>를 입력하고 저장하세요. <br />
                                        모든 준비가 완료되었습니다!
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
