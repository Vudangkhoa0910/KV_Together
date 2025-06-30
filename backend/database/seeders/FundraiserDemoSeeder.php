<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Activity;
use App\Models\News;
use App\Models\Donation;
use App\Models\Category;
use App\Models\Notification;
use App\Models\VirtualWallet;
use App\Models\CreditTransaction;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FundraiserDemoSeeder extends Seeder
{
    public function run()
    {
        // Tìm user fundraiser
        $fundraiser = User::where('email', 'khoaraiser@gmail.com')->first();
        
        if (!$fundraiser) {
            echo "Fundraiser khoaraiser@gmail.com không tồn tại. Vui lòng chạy UserSeeder trước.\n";
            return;
        }

        // Tạo virtual wallet cho fundraiser
        $wallet = VirtualWallet::firstOrCreate([
            'user_id' => $fundraiser->id,
        ], [
            'balance' => 5000000, // 5 triệu Credits ban đầu
            'total_earned' => 15000000, // Tổng đã kiếm được
            'total_spent' => 10000000, // Tổng đã tiêu
            'tier' => 'gold',
            'last_activity' => now(),
        ]);

        // Tạo các giao dịch ví
        $this->createWalletTransactions($wallet);

        // Lấy categories
        $categories = Category::all();
        if ($categories->isEmpty()) {
            echo "Không có categories. Vui lòng chạy CategorySeeder trước.\n";
            return;
        }

        // Tạo campaigns cho fundraiser
        $this->createCampaigns($fundraiser, $categories);

        // Tạo activities cho fundraiser
        $this->createActivities($fundraiser, $categories);

        // Tạo news cho fundraiser
        $this->createNews($fundraiser, $categories);

        // Tạo notifications cho fundraiser
        $this->createNotifications($fundraiser);

        echo "✅ Đã tạo dữ liệu demo đầy đủ cho fundraiser khoaraiser@gmail.com\n";
    }

    private function copyImageFromData($sourcePath, $destinationType = 'campaigns')
    {
        // Path to data directory is in parent directory of backend
        $fullSourcePath = dirname(base_path()) . '/' . $sourcePath;
        
        if (!File::exists($fullSourcePath)) {
            return null;
        }

        // Ensure destination directory exists
        $destinationDir = storage_path("app/public/{$destinationType}");
        if (!File::exists($destinationDir)) {
            File::makeDirectory($destinationDir, 0755, true);
        }

        // Generate unique filename
        $extension = pathinfo($fullSourcePath, PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . pathinfo($fullSourcePath, PATHINFO_BASENAME);
        $destinationPath = "{$destinationType}/{$filename}";
        $fullDestinationPath = storage_path("app/public/{$destinationPath}");

        // Copy file
        File::copy($fullSourcePath, $fullDestinationPath);

        return $destinationPath;
    }

    private function createWalletTransactions($wallet)
    {
        $transactions = [
            [
                'type' => 'earn',
                'amount' => 2000000,
                'description' => 'Hoa hồng từ chiến dịch "Giúp đỡ trẻ em vùng cao"',
                'source_type' => 'bonus',
                'created_at' => now()->subDays(30),
            ],
            [
                'type' => 'earn',
                'amount' => 1500000,
                'description' => 'Hoa hồng từ chiến dịch "Xây dựng trường học"',
                'source_type' => 'bonus',
                'created_at' => now()->subDays(25),
            ],
            [
                'type' => 'spend',
                'amount' => -500000,
                'description' => 'Quyên góp cho chiến dịch "Hỗ trợ người già"',
                'source_type' => 'campaign_support',
                'created_at' => now()->subDays(20),
            ],
            [
                'type' => 'earn',
                'amount' => 3000000,
                'description' => 'Hoa hồng từ chiến dịch "Cứu trợ thiên tai"',
                'source_type' => 'bonus',
                'created_at' => now()->subDays(15),
            ],
            [
                'type' => 'spend',
                'amount' => -1000000,
                'description' => 'Quyên góp cho chiến dịch "Giáo dục trẻ em khuyết tật"',
                'source_type' => 'campaign_support',
                'created_at' => now()->subDays(10),
            ],
            [
                'type' => 'earn',
                'amount' => 2500000,
                'description' => 'Hoa hồng từ chiến dịch "Phẫu thuật tim cho trẻ em"',
                'source_type' => 'bonus',
                'created_at' => now()->subDays(5),
            ],
        ];

        foreach ($transactions as $transaction) {
            CreditTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => $transaction['type'],
                'amount' => abs($transaction['amount']),
                'source_type' => $transaction['source_type'],
                'description' => $transaction['description'],
                'balance_before' => 0, // Sẽ được tính toán trong model
                'balance_after' => 0, // Sẽ được tính toán trong model
                'created_at' => $transaction['created_at'],
                'updated_at' => $transaction['created_at'],
            ]);
        }
    }

    private function createCampaigns($fundraiser, $categories)
    {
        $campaigns = [
            [
                'title' => 'Giúp đỡ trẻ em vùng cao có cơ hội đến trường',
                'slug' => 'giup-do-tre-em-vung-cao-co-co-hoi-den-truong',
                'description' => 'Chiến dịch nhằm hỗ trợ các em nhỏ ở vùng cao có điều kiện học tập tốt hơn, bao gồm sách vở, đồng phục và học phí.',
                'content' => '<h2>Câu chuyện về những em nhỏ vùng cao</h2><p>Ở những vùng núi cao hiểm trở, việc đến trường đối với các em nhỏ là một thử thách lớn. Không chỉ vì con đường xa xôi, mà còn vì hoàn cảnh kinh tế khó khăn của gia đình.</p><p>Chúng tôi mong muốn mang đến cho các em cơ hội học tập tốt hơn thông qua việc hỗ trợ học phí, sách vở và đồng phục.</p>',
                'target_amount' => 50000000,
                'current_amount' => 45000000,
                'start_date' => now()->subDays(45),
                'end_date' => now()->addDays(15),
                'status' => 'active',
                'image_source' => 'data/news/community/project2/img/01.webp',
                'is_featured' => true,
                'category_slug' => 'education',
            ],
            [
                'title' => 'Xây dựng thư viện cho trường tiểu học vùng sâu',
                'slug' => 'xay-dung-thu-vien-cho-truong-tieu-hoc-vung-sau',
                'description' => 'Dự án xây dựng thư viện hiện đại cho trường tiểu học ở vùng sâu, vùng xa, giúp các em có môi trường học tập tốt hơn.',
                'content' => '<h2>Tầm quan trọng của thư viện trường học</h2><p>Thư viện không chỉ là nơi chứa sách, mà còn là không gian học tập, nghiên cứu quan trọng cho học sinh.</p><p>Với việc xây dựng thư viện mới, chúng tôi hy vọng sẽ tạo ra một môi trường học tập hiện đại và thân thiện cho các em học sinh.</p>',
                'target_amount' => 80000000,
                'current_amount' => 25000000,
                'start_date' => now()->subDays(30),
                'end_date' => now()->addDays(30),
                'status' => 'active',
                'image_source' => 'data/news/community/project2/img/01.webp',
                'is_featured' => false,
                'category_slug' => 'education',
            ],
            [
                'title' => 'Phẫu thuật tim miễn phí cho trẻ em nghèo',
                'slug' => 'phau-thuat-tim-mien-phi-cho-tre-em-ngheo',
                'description' => 'Chương trình phẫu thuật tim miễn phí cho các em nhỏ mắc bệnh tim bẩm sinh có hoàn cảnh khó khăn.',
                'content' => '<h2>Mang lại nhịp tim khỏe mạnh</h2><p>Bệnh tim bẩm sinh là một trong những nguyên nhân gây tử vong hàng đầu ở trẻ em. Tuy nhiên, với y học hiện đại, nhiều trường hợp có thể được điều trị thành công.</p><p>Chúng tôi mong muốn giúp đỡ những gia đình có hoàn cảnh khó khăn có thể tiếp cận với dịch vụ y tế chất lượng cao.</p>',
                'target_amount' => 200000000,
                'current_amount' => 200000000,
                'start_date' => now()->subDays(60),
                'end_date' => now()->subDays(5),
                'status' => 'completed',
                'image_source' => 'data/news/story/project1/img/01.avif',
                'is_featured' => true,
                'category_slug' => 'medical',
            ],
            [
                'title' => 'Cứu trợ khẩn cấp cho người dân vùng lũ',
                'slug' => 'cuu-tro-khan-cap-cho-nguoi-dan-vung-lu',
                'description' => 'Hỗ trợ khẩn cấp thực phẩm, nước sạch và nhu yếu phẩm cho người dân bị ảnh hưởng bởi lũ lụt.',
                'content' => '<h2>Chung tay vượt qua thiên tai</h2><p>Lũ lụt đã gây ra những thiệt hại nghiêm trọng cho người dân, nhiều gia đình mất nhà cửa, tài sản.</p><p>Chúng tôi cần sự giúp đỡ khẩn cấp để cung cấp thực phẩm, nước sạch và các nhu yếu phẩm thiết yếu cho bà con.</p>',
                'target_amount' => 100000000,
                'current_amount' => 75000000,
                'start_date' => now()->subDays(20),
                'end_date' => now()->subDays(2),
                'status' => 'ended_partial',
                'image_source' => 'data/news/community/project3/img/01.webp',
                'is_featured' => false,
                'category_slug' => 'disaster',
            ],
            [
                'title' => 'Chăm sóc người cao tuổi neo đơn',
                'slug' => 'cham-soc-nguoi-cao-tuoi-neo-don',
                'description' => 'Chương trình chăm sóc sức khỏe và tinh thần cho những người cao tuổi sống một mình, không có người thân.',
                'content' => '<h2>Không để ai bị bỏ lại phía sau</h2><p>Những người cao tuổi neo đơn thường phải đối mặt với sự cô đơn và thiếu thốn trong cuộc sống hàng ngày.</p><p>Chương trình của chúng tôi sẽ cung cấp dịch vụ chăm sóc sức khỏe định kỳ và hoạt động giao lưu để họ cảm thấy được yêu thương.</p>',
                'target_amount' => 60000000,
                'current_amount' => 30000000,
                'start_date' => now()->subDays(15),
                'end_date' => now()->addDays(45),
                'status' => 'active',
                'image_source' => 'data/news/community/project4/img/01.jpeg',
                'is_featured' => false,
                'category_slug' => 'elderly',
            ],
        ];

        foreach ($campaigns as $campaignData) {
            $categorySlug = $campaignData['category_slug'];
            $imageSource = $campaignData['image_source'];
            unset($campaignData['category_slug'], $campaignData['image_source']);
            
            // Copy image from data directory
            $imagePath = $this->copyImageFromData($imageSource, 'campaigns');
            if ($imagePath) {
                $campaignData['image'] = $imagePath;
            }
            
            $campaign = Campaign::updateOrCreate([
                'slug' => $campaignData['slug'],
            ], [
                ...$campaignData,
                'organizer_id' => $fundraiser->id,
                'created_at' => $campaignData['start_date'],
                'updated_at' => now(),
            ]);

            // Attach category
            $category = $categories->where('slug', $categorySlug)->first();
            if ($category) {
                $campaign->categories()->sync([$category->id]);
            }

            // Tạo donations cho campaign nếu chưa có
            if ($campaign->donations()->count() === 0) {
                $this->createDonationsForCampaign($campaign);
            }
        }
    }

    private function createDonationsForCampaign($campaign)
    {
        // Lấy danh sách users để tạo donations (không bao gồm chính fundraiser)
        $users = User::where('id', '!=', $campaign->organizer_id)->limit(20)->get();
        
        if ($users->isEmpty()) {
            return;
        }
        
        $donationCount = rand(10, 30);
        $totalDonated = 0;

        for ($i = 0; $i < $donationCount && $totalDonated < $campaign->current_amount; $i++) {
            $user = $users->random();
            $amount = rand(100000, 2000000); // Từ 100k đến 2M
            
            if ($totalDonated + $amount > $campaign->current_amount) {
                $amount = $campaign->current_amount - $totalDonated;
            }

            Donation::create([
                'user_id' => $user->id,
                'campaign_id' => $campaign->id,
                'amount' => $amount,
                'message' => $this->getRandomDonationMessage(),
                'payment_method' => collect(['bank_transfer', 'momo', 'vnpay', 'credits'])->random(),
                'status' => 'completed',
                'is_anonymous' => rand(0, 1),
                'created_at' => $campaign->start_date->addDays(rand(0, max(1, $campaign->start_date->diffInDays(now())))),
            ]);

            $totalDonated += $amount;
        }
    }

    private function getRandomDonationMessage()
    {
        $messages = [
            'Chúc chiến dịch thành công!',
            'Hy vọng có thể giúp được một phần nào đó.',
            'Cảm ơn vì những việc làm ý nghĩa này.',
            'Mong các em sớm có cuộc sống tốt hơn.',
            'Gửi một chút tấm lòng.',
            'Chúc mọi người luôn khỏe mạnh.',
            'Cùng nhau làm điều tốt đẹp.',
            'Hy vọng chiến dịch sẽ đạt được mục tiêu.',
            'Thật sự cảm động với câu chuyện này.',
            'Tôi sẽ chia sẻ để nhiều người biết hơn.',
        ];

        return $messages[array_rand($messages)];
    }

    private function createActivities($fundraiser, $categories)
    {
        $activities = [
            [
                'title' => 'Tình nguyện dạy học cho trẻ em vùng cao',
                'slug' => 'tinh-nguyen-day-hoc-cho-tre-em-vung-cao',
                'summary' => 'Hoạt động tình nguyện dạy học miễn phí cho các em nhỏ ở vùng cao trong 2 tuần.',
                'description' => '<h2>Hoạt động dạy học tình nguyện</h2><p>Chúng tôi tổ chức hoạt động dạy học tình nguyện tại các vùng cao, giúp các em nhỏ có thêm kiến thức và kỹ năng.</p><p>Hoạt động kéo dài 2 tuần với nhiều môn học thú vị như Toán, Văn, Tiếng Anh và các kỹ năng sống.</p>',
                'location' => 'Hà Giang, Việt Nam',
                'event_date' => now()->addDays(10),
                'registration_deadline' => now()->addDays(24),
                'max_participants' => 50,
                'current_participants' => 35,
                'contact_email' => 'khoaraiser@gmail.com',
                'contact_phone' => '0123456781',
                'status' => 'published',
                'image_source' => 'data/ActivitiesOfVolunteering/TourDuLichTinhNguyen/project1/img/01.jpg',
                'is_featured' => true,
                'category' => 'education',
            ],
            [
                'title' => 'Làm sạch bãi biển và bảo vệ môi trường',
                'slug' => 'lam-sach-bai-bien-va-bao-ve-moi-truong',
                'summary' => 'Hoạt động dọn dẹp bãi biển, thu gom rác thải và tuyên truyền bảo vệ môi trường biển.',
                'description' => '<h2>Bảo vệ môi trường biển</h2><p>Hoạt động dọn dẹp bãi biển nhằm nâng cao ý thức bảo vệ môi trường và giữ gìn vẻ đẹp tự nhiên.</p><p>Chúng ta sẽ cùng nhau thu gom rác thải, phân loại và tuyên truyền về tác hại của rác thải nhựa.</p>',
                'location' => 'Bãi biển Đà Nẵng',
                'event_date' => now()->addDays(5),
                'registration_deadline' => now()->addDays(5),
                'max_participants' => 100,
                'current_participants' => 78,
                'contact_email' => 'khoaraiser@gmail.com',
                'contact_phone' => '0123456781',
                'status' => 'published',
                'image_source' => 'data/ActivitiesOfVolunteering/TourDuLichTinhNguyen/project2/img/01.jpg',
                'is_featured' => true,
                'category' => 'environment',
            ],
            [
                'title' => 'Khám sức khỏe miễn phí cho người cao tuổi',
                'slug' => 'kham-suc-khoe-mien-phi-cho-nguoi-cao-tuoi',
                'summary' => 'Chương trình khám sức khỏe miễn phí dành cho người cao tuổi có hoàn cảnh khó khăn.',
                'description' => '<h2>Chăm sóc sức khỏe người cao tuổi</h2><p>Chương trình khám sức khỏe miễn phí với đội ngũ bác sĩ chuyên khoa, cung cấp dịch vụ khám tổng quát và tư vấn sức khỏe.</p>',
                'location' => 'Trung tâm Y tế Quận 1, TP.HCM',
                'event_date' => now()->subDays(5),
                'registration_deadline' => now()->subDays(5),
                'max_participants' => 30,
                'current_participants' => 30,
                'contact_email' => 'khoaraiser@gmail.com',
                'contact_phone' => '0123456781',
                'status' => 'completed',
                'image_source' => 'data/ActivitiesOfVolunteering/TourDuLichTinhNguyen/project3/img/01.jpeg',
                'is_featured' => false,
                'category' => 'medical',
            ],
        ];

        foreach ($activities as $activityData) {
            $imageSource = $activityData['image_source'];
            unset($activityData['image_source']);
            
            // Copy image from data directory
            $imagePath = $this->copyImageFromData($imageSource, 'activities');
            if ($imagePath) {
                $activityData['image'] = $imagePath;
            }
            
            Activity::updateOrCreate([
                'slug' => $activityData['slug'],
            ], [
                ...$activityData,
                'organizer_id' => $fundraiser->id,
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now(),
            ]);
        }
    }

    private function createNews($fundraiser, $categories)
    {
        $news = [
            [
                'title' => 'Kết quả chiến dịch "Phẫu thuật tim miễn phí" - 50 em nhỏ được cứu sống',
                'slug' => 'ket-qua-chien-dich-phau-thuat-tim-mien-phi-50-em-nho-duoc-cuu-song',
                'summary' => 'Sau 2 tháng triển khai, chiến dịch "Phẫu thuật tim miễn phí cho trẻ em nghèo" đã thành công cứu sống 50 em nhỏ mắc bệnh tim bẩm sinh.',
                'content' => '<h2>Thành công vượt ngoài mong đợi</h2><p>Chiến dịch "Phẫu thuật tim miễn phí cho trẻ em nghèo" đã kết thúc với kết quả vượt ngoài mong đợi. Tổng cộng 50 em nhỏ từ khắp cả nước đã được phẫu thuật thành công.</p><p>Các em đều có tình trạng sức khỏe ổn định và đang trong quá trình phục hồi tại bệnh viện. Gia đình các em đều vô cùng biết ơn sự giúp đỡ của cộng đồng.</p><h3>Những con số ấn tượng</h3><ul><li>50 ca phẫu thuật thành công</li><li>200 triệu VND được quyên góp</li><li>1,200 người tham gia ủng hộ</li><li>15 bác sĩ tình nguyện tham gia</li></ul>',
                'image_source' => 'data/news/story/project2/img/01.jpeg',
                'category' => 'story',
                'status' => 'published',
                'is_featured' => true,
                'views_count' => 1250,
                'published_date' => now()->subDays(3),
            ],
            [
                'title' => 'Khai trương thư viện mới tại trường tiểu học vùng sâu',
                'slug' => 'khai-truong-thu-vien-moi-tai-truong-tieu-hoc-vung-sau',
                'summary' => 'Thư viện hiện đại với hơn 2,000 đầu sách đã chính thức khai trương tại trường tiểu học Tân Hưng, huyện Mù Cang Chải.',
                'content' => '<h2>Thư viện hiện đại cho vùng sâu</h2><p>Sau 6 tháng xây dựng, thư viện mới của trường tiểu học Tân Hưng đã chính thức đi vào hoạt động. Thư viện được trang bị hiện đại với hơn 2,000 đầu sách đa dạng.</p><p>Đây là thành quả của chiến dịch quyên góp "Xây dựng thư viện cho trường tiểu học vùng sâu" với sự đóng góp của hàng trăm nhà hảo tâm.</p>',
                'image_source' => 'data/news/community/project5/img/01.png',
                'category' => 'story',
                'status' => 'published',
                'is_featured' => true,
                'views_count' => 890,
                'published_date' => now()->subDays(7),
            ],
            [
                'title' => 'Hoạt động dọn dẹp bãi biển thu hút hơn 500 tình nguyện viên',
                'slug' => 'hoat-dong-don-dep-bai-bien-thu-hut-hon-500-tinh-nguyen-vien',
                'summary' => 'Sự kiện "Làm sạch bãi biển Đà Nẵng" đã thu hút sự tham gia của hơn 500 tình nguyện viên, thu gom được 2 tấn rác thải.',
                'content' => '<h2>Cộng đồng chung tay bảo vệ môi trường</h2><p>Hoạt động dọn dẹp bãi biển Đà Nẵng đã diễn ra thành công với sự tham gia của hơn 500 tình nguyện viên từ khắp cả nước.</p><p>Trong 1 ngày, các tình nguyện viên đã thu gom được 2 tấn rác thải, chủ yếu là nhựa và các vật liệu không phân hủy sinh học.</p>',
                'image_source' => 'data/news/event/project1/img/01.jpeg',
                'category' => 'event',
                'status' => 'published',
                'is_featured' => false,
                'views_count' => 650,
                'published_date' => now()->subDays(10),
            ],
            [
                'title' => 'Chương trình "Tết ấm cho người vô gia cư" chuẩn bị khởi động',
                'slug' => 'chuong-trinh-tet-am-cho-nguoi-vo-gia-cu-chuan-bi-khoi-dong',
                'summary' => 'Chương trình "Tết ấm cho người vô gia cư" sẽ được tổ chức trong dịp Tết Nguyên đán, mang lại niềm vui cho những người khó khăn.',
                'content' => '<h2>Tết ấm cho mọi người</h2><p>Nhằm mang lại một cái Tết ấm áp cho những người vô gia cư, chúng tôi đang chuẩn bị khởi động chương trình "Tết ấm cho người vô gia cư".</p><p>Chương trình sẽ cung cấp bữa ăn miễn phí, quà Tết và chỗ ở tạm thời trong suốt dịp Tết Nguyên đán.</p>',
                'image_source' => 'data/news/story/project3/img/01.jpg',
                'category' => 'announcement',
                'status' => 'draft',
                'is_featured' => false,
                'views_count' => 0,
                'published_date' => now(), // Đặt ngày hiện tại thay vì null
            ],
        ];

        foreach ($news as $newsData) {
            $imageSource = $newsData['image_source'];
            unset($newsData['image_source']);
            
            // Copy image from data directory
            $imagePath = $this->copyImageFromData($imageSource, 'news');
            if ($imagePath) {
                $newsData['image'] = $imagePath;
            }
            
            News::updateOrCreate([
                'slug' => $newsData['slug'],
            ], [
                ...$newsData,
                'author_id' => $fundraiser->id,
                'created_at' => $newsData['published_date'] ?? now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function createNotifications($fundraiser)
    {
        $notifications = [
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\\Notifications\\CampaignDonation',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $fundraiser->id,
                'data' => json_encode([
                    'title' => 'Có quyên góp mới cho chiến dịch của bạn',
                    'message' => 'Nguyễn Văn A đã quyên góp 500,000 VND cho chiến dịch "Giúp đỡ trẻ em vùng cao"',
                    'campaign_id' => 1,
                    'donation_amount' => 500000
                ]),
                'read_at' => null,
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2),
            ],
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\\Notifications\\CampaignMilestone',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $fundraiser->id,
                'data' => json_encode([
                    'title' => 'Chiến dịch đạt được 90% mục tiêu',
                    'message' => 'Chiến dịch "Giúp đỡ trẻ em vùng cao" đã đạt được 90% mục tiêu quyên góp',
                    'campaign_id' => 1,
                    'percentage' => 90
                ]),
                'read_at' => now()->subHours(1),
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ],
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\\Notifications\\ActivityRegistration',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $fundraiser->id,
                'data' => json_encode([
                    'title' => 'Có người đăng ký tham gia hoạt động',
                    'message' => 'Trần Thị B đã đăng ký tham gia hoạt động "Tình nguyện dạy học cho trẻ em vùng cao"',
                    'activity_id' => 1
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\\Notifications\\CampaignCompleted',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $fundraiser->id,
                'data' => json_encode([
                    'title' => 'Chiến dịch hoàn thành thành công',
                    'message' => 'Chiến dịch "Phẫu thuật tim miễn phí" đã hoàn thành với 200 triệu VND được quyên góp',
                    'campaign_id' => 3,
                    'final_amount' => 200000000
                ]),
                'read_at' => now(),
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\\Notifications\\WalletEarning',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $fundraiser->id,
                'data' => json_encode([
                    'title' => 'Bạn nhận được hoa hồng từ chiến dịch',
                    'message' => 'Bạn đã nhận được 2,500,000 VND hoa hồng từ chiến dịch "Phẫu thuật tim miễn phí"',
                    'amount' => 2500000,
                    'campaign_id' => 3
                ]),
                'read_at' => null,
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
        ];

        // Xóa notifications cũ của fundraiser trước
        DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $fundraiser->id)
            ->delete();
        
        foreach ($notifications as $notificationData) {
            DB::table('notifications')->insert($notificationData);
        }
    }
}
